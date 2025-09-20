import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import Toast from "./Toast";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { OCEAN_DATA, getLayerColor } from "../data/oceanData";
import {
  FISHING_SPOTS,
  FISHER_MAP_STYLE,
  RESEARCHER_MAP_STYLE,
} from "../data/fishersData";
import L from "leaflet";

const ZoomAwareSpottedMarker = ({ center, color, isHighlighted, children }) => {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());
  const markerRef = useRef(null);

  const baseSize = isHighlighted ? 10 : 8;

  useEffect(() => {
    const updateZoom = () => {
      setZoomLevel(map.getZoom());
    };

    map.on("zoomend", updateZoom);
    return () => {
      map.off("zoomend", updateZoom);
    };
  }, [map]);

  const getSizeFactor = () => {
    if (zoomLevel <= 5) return 1;

    return Math.pow(1.2, zoomLevel - 5);
  };

  const adjustedRadius = baseSize * getSizeFactor();

  const createSpottedCanvas = () => {
    const SpottedRenderer = L.Canvas.extend({
      _updateCircle: function (layer) {
        if (!this._drawing || layer._empty()) {
          return;
        }

        const p = layer._point;
        const ctx = this._ctx;
        const r = Math.max(Math.round(layer._radius), 1);
        const s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

        ctx.save();

        if (s !== 1) {
          ctx.scale(1, s);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);
        ctx.closePath();

        if (layer.options.fill) {
          ctx.globalAlpha = layer.options.fillOpacity;
          ctx.fillStyle = layer.options.fillColor || layer.options.color;
          ctx.fill();
        }

        const isHighlighted = layer.options.fillOpacity > 0.8;
        const spotColor = isHighlighted ? "#333" : "#444";
        const spotsCount = isHighlighted ? 8 : 5;

        ctx.fillStyle = spotColor;
        ctx.globalAlpha = isHighlighted ? 0.8 : 0.6;

        const seed = p.x * p.y;
        const pseudoRandom = (n) => (Math.sin(seed + n) + 1) * 0.5;

        for (let i = 0; i < spotsCount; i++) {
          const angle = pseudoRandom(i) * Math.PI * 2;
          const distance = pseudoRandom(i + 100) * r * 0.7;
          const spotX = p.x + Math.cos(angle) * distance;
          const spotY = p.y / s + Math.sin(angle) * distance;
          const spotRadius = r * (0.2 + pseudoRandom(i + 200) * 0.2);

          ctx.beginPath();
          ctx.arc(spotX, spotY, spotRadius, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.closePath();
        }

        if (layer.options.stroke && layer.options.weight !== 0) {
          ctx.globalAlpha = layer.options.opacity;
          ctx.lineWidth = layer.options.weight;
          ctx.strokeStyle = layer.options.color;
          ctx.stroke();
        }

        ctx.restore();
      },
    });

    return new SpottedRenderer();
  };

  return (
    <CircleMarker
      ref={markerRef}
      center={center}
      radius={adjustedRadius}
      pathOptions={{
        color: "#000",
        fillColor: color,
        fillOpacity: isHighlighted ? 0.95 : 0.7,
        weight: isHighlighted ? 2 : 1,
      }}
      renderer={createSpottedCanvas()}
      className="leaflet-shadow-marker"
    >
      {children}
    </CircleMarker>
  );
};

const MapTiles = () => (
  <TileLayer
    attribution=""
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    noWrap={false}
    continuousWorld={true}
  />
);
function FitToBounds({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      setTimeout(() => {
        map.fitBounds(bounds, { padding: [24, 24], animate: true });
      }, 100);
    }
  }, [bounds, map]);
  return null;
}
function ResetView({ triggerReset, defaultCenter, defaultZoom }) {
  const map = useMap();
  useEffect(() => {
    if (triggerReset) {
      map.setView(defaultCenter, defaultZoom);
    }
  }, [triggerReset, map, defaultCenter, defaultZoom]);
  return null;
}
function HeatmapLayer({ data, layerType }) {
  const map = useMap();

  useEffect(() => {
    if (
      !data ||
      !layerType ||
      layerType === "none" ||
      Object.keys(data).length === 0
    ) {
      return;
    }

    try {
      const points = [];
      Object.values(data).forEach((region) => {
        if (region[layerType]) {
          points.push(
            ...region[layerType].points.map((p) => ({
              lat: p.lat,
              lng: p.lng,
              value: p.value,
            }))
          );
        }
      });

      if (points.length === 0) return;

      const heatLayer = L.heatLayer(
        points.map((p) => [p.lat, p.lng, p.value]),
        {
          radius: 35,
          blur: 25,
          maxZoom: 10,
          minOpacity: 0.4,
          max: Math.max(...points.map((p) => p.value)),
          gradient: {
            0.2: getLayerColor(points[0].value, layerType),
            0.5: getLayerColor(
              points[Math.floor(points.length / 2)].value,
              layerType
            ),
            0.8: getLayerColor(points[points.length - 1].value, layerType),
          },
        }
      ).addTo(map);

      return () => {
        map.removeLayer(heatLayer);
      };
    } catch (error) {
      console.error("Error rendering heatmap:", error);
    }
  }, [map, data, layerType]);

  return null;
}
function MapWatcher({
  defaultCenter,
  defaultZoom,
  setShowResetButton,
  isResetting,
}) {
  useMapEvents({
    moveend(e) {
      if (isResetting.current) return;

      const map = e.target;
      const center = map.getCenter();
      const zoom = map.getZoom();

      if (
        Math.abs(center.lat - defaultCenter[0]) > 0.001 ||
        Math.abs(center.lng - defaultCenter[1]) > 0.001 ||
        zoom !== defaultZoom
      ) {
        setShowResetButton(true);
      } else {
        setShowResetButton(false);
      }
    },
  });
  return null;
}

export default function MapView({
  markers,
  onResetMarkers,
  triggerReset,
  selectedRegionBounds,
  activeLayer,
  viewMode = "researcher",
}) {
  const defaultCenter = [21.5937, 80.9629];
  const defaultZoom = 4.7;
  const [showWarning, setShowWarning] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);
  const isResetting = useRef(false);

  const getCatchRateColor = (rate) => {
    if (rate >= 90) return "#10B981";
    if (rate >= 70) return "#34D399";
    if (rate >= 50) return "#FBBF24";
    if (rate >= 30) return "#FB923C";
    return "#EF4444";
  };

  const displayMarkers =
    viewMode === "fisher"
      ? FISHING_SPOTS.map((spot) => ({
          ...spot,
          color: getCatchRateColor(spot.catchRate),
          isHighlighted: false,
        }))
      : markers;

  useEffect(() => {
    if (activeLayer !== "none" && markers.length === 0) {
      setShowWarning(true);
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeLayer, markers.length]);

  const visibleRegions = markers.reduce((acc, marker) => {
    if (OCEAN_DATA[marker.regionKey]) {
      acc[marker.regionKey] = OCEAN_DATA[marker.regionKey];
    }
    return acc;
  }, {});

  function FloatingPanel() {
    if (!showResetButton) return null;
    return (
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => {
            setShowResetButton(false);
            isResetting.current = true;
            onResetMarkers();
            setTimeout(() => {
              isResetting.current = false;
            }, 1000);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md"
        >
          RESET VIEW
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {showWarning && (
        <Toast
          message="Please select a species first to view oceanographic data"
          onClose={() => setShowWarning(false)}
        />
      )}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
        maxZoom={10}
        minZoom={2}
        maxBoundsViscosity={1.0}
        worldCopyJump={true}
      >
        <MapTiles viewMode={viewMode} />
        {selectedRegionBounds && <FitToBounds bounds={selectedRegionBounds} />}
        <FloatingPanel />
        <HeatmapLayer data={visibleRegions} layerType={activeLayer} />
        <ResetView
          triggerReset={triggerReset}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
        />
        <MapWatcher
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          setShowResetButton={setShowResetButton}
          isResetting={isResetting}
        />
        {displayMarkers.map((m, idx) => (
          <ZoomAwareSpottedMarker
            key={`${m.speciesId}-${idx}`}
            center={[m.lat, m.lng]}
            color={m.color}
            isHighlighted={m.isHighlighted}
          >
            <Popup>
              <div className="text-sm">
                {m.fishingSpot ? (
                  <>
                    <div className="font-semibold">Fishing Area</div>
                    <div className="opacity-80">{m.region}</div>
                    <div className="mt-1 font-medium">
                      Catch Rate:{" "}
                      <span
                        className={`${
                          getCatchRateColor(m.catchRate).includes("#")
                            ? ""
                            : getCatchRateColor(m.catchRate).replace(
                                "bg-",
                                "text-"
                              )
                        }`}
                        style={{
                          color: getCatchRateColor(m.catchRate).includes("#")
                            ? getCatchRateColor(m.catchRate)
                            : "",
                        }}
                      >
                        {m.catchRate}%
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] opacity-60">
                      Lat {m.lat.toFixed(3)}, Lng {m.lng.toFixed(3)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold">{m.species}</div>
                    <div className="opacity-80">{m.regionName}</div>
                    <div className="mt-1 text-[11px] opacity-60">
                      Lat {m.lat.toFixed(3)}, Lng {m.lng.toFixed(3)}
                    </div>
                  </>
                )}
              </div>
            </Popup>
          </ZoomAwareSpottedMarker>
        ))}
      </MapContainer>
    </div>
  );
}
