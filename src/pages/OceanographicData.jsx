import { useMemo, useState, useEffect, useRef } from "react";
import MapView from "../components/MapView";

import SearchBar from "../components/SearchBar";
import SpeciesLegend from "../components/SpeciesLegend";
import OceanDataLayers from "../components/OceanDataLayers";
import { REGIONS, SIGHTINGS } from "../data/sightingsData";
import { OCEAN_DATA } from "../data/oceanData";

export default function OceanographicData() {
  const [selected, setSelected] = useState(null);
  const [mapWidthPercent, setMapWidthPercent] = useState(65);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [reset, setReset] = useState(false);
  const [resetSearch, setResetSearch] = useState(false);
  const [activeLayer, setActiveLayer] = useState("none");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  const isMobile = viewportWidth < 768;

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleReset = () => {
    setSelected(null);
    setReset(true);
    // Reset the search bar
    setResetSearch(true);
    setTimeout(() => {
      setReset(false);
      setResetSearch(false); // Reset the flag after a short delay
    }, 200);
  };
  const markers = useMemo(() => {
    if (!selected) return [];
    const color = selected.color;
    return SIGHTINGS.filter((d) => d.speciesId === selected.id).map((d) => ({
      ...d,
      color,
      regionName: REGIONS[d.regionKey]?.name || d.regionKey,
    }));
  }, [selected]);

  const selectedRegionBounds = useMemo(() => {
    if (!selected) return null;
    const regions = new Set(
      SIGHTINGS.filter((s) => s.speciesId === selected.id).map(
        (s) => s.regionKey
      )
    );
    const boundsList = Array.from(regions)
      .map((k) => REGIONS[k]?.bounds)
      .filter(Boolean);
    if (boundsList.length === 0) return null;

    const merged = boundsList.reduce((acc, b) => {
      const [[s1w1, s1w2], [n1e1, n1e2]] = b.map((x) => [x[0], x[1]]);
      if (!acc)
        return [
          [s1w1, s1w2],
          [n1e1, n1e2],
        ];
      return [
        [Math.min(acc[0][0], s1w1), Math.min(acc[0][1], s1w2)],
        [Math.max(acc[1][0], n1e1), Math.max(acc[1][1], n1e2)],
      ];
    }, null);
    return merged;
  }, [selected]);

  const onDragStart = (e) => {
    if (isMobile) return;
    draggingRef.current = true;
    setIsDragging(true);
    document.body.style.userSelect = "none";
  };

  const onDragEnd = () => {
    draggingRef.current = false;
    setIsDragging(false);
    document.body.style.userSelect = "auto";
  };

  const onDrag = (e) => {
    if (!draggingRef.current) return;
    let clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let newPercent = ((clientX - rect.left) / rect.width) * 100;
    if (newPercent < 20) newPercent = 20;
    if (newPercent > 80) newPercent = 80;
    setMapWidthPercent(newPercent);
  };

  useEffect(() => {
    window.addEventListener("mouseup", onDragEnd);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("touchend", onDragEnd);
    window.addEventListener("touchmove", onDrag, { passive: false });
    return () => {
      window.removeEventListener("mouseup", onDragEnd);
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("touchend", onDragEnd);
      window.removeEventListener("touchmove", onDrag);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-ocean-50 text-slate-900 overflow-hidden flex flex-col">
      <header className="w-full p-3 sm:p-4 flex items-center justify-between bg-white shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 grid place-items-center shadow-soft">
            <span className="text-white text-lg font-bold">S</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
              Welcome to SamudraNet
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 -mt-0.5">
              Marine Species Mapper
            </p>
          </div>
        </div>
      </header>
      <div
        ref={containerRef}
        className={`flex flex-1 ${
          isMobile ? "flex-col" : "flex-row"
        } overflow-hidden`}
      >
        <div
          className="transition-all duration-200 ease-out relative p-2 md:p-4"
          style={{
            flexBasis: isMobile ? "50%" : `${mapWidthPercent}%`,
            height: isMobile ? "50vh" : "auto",
            minHeight: isMobile ? "300px" : "auto",
          }}
        >
          <div className="h-full w-full rounded-2xl overflow-hidden shadow-md border border-white/10 bg-ocean-800/40 backdrop-blur">
            <MapView
              markers={markers}
              selectedRegionBounds={selectedRegionBounds}
              onResetMarkers={handleReset}
              triggerReset={reset}
              isMobile={isMobile}
              activeLayer={activeLayer}
            />
          </div>
        </div>
        {!isMobile && (
          <div
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            className="w-[4px] cursor-col-resize bg-slate-700 hover:bg-slate-400 transition-colors duration-150"
          />
        )}
        <div
          className="transition-all duration-200 ease-out relative flex flex-col gap-4 p-4 overflow-y-auto"
          style={{
            flexGrow: 1,
            flexShrink: 0,
            height: isMobile ? "50vh" : "100%",
          }}
        >
          <div className="relative z-50">
            <SearchBar
              onSelect={(s) => setSelected(s)}
              resetSearch={resetSearch}
            />
            <div className="px-4 mt-2 text-center text-xs text-slate-400">
              Search by scientific name. Tap a result to plot sightings.
            </div>
          </div>
          {markers.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm px-5 py-2 rounded-lg shadow transition duration-200 cursor-pointer"
              >
                Open Ocean Data
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 mt-4">
            {markers.length > 0 && (
              <OceanDataLayers
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onLayerChange={setActiveLayer}
                visibleRegions={markers.reduce((acc, marker) => {
                  if (OCEAN_DATA[marker.regionKey]) {
                    acc[marker.regionKey] = OCEAN_DATA[marker.regionKey];
                  }
                  return acc;
                }, {})}
              />
            )}
            <SpeciesLegend activeId={selected?.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
