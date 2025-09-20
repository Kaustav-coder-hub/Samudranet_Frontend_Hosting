import { useState, useRef, useEffect } from "react";
import { FISHING_SPOTS } from "../data/fishersData";

export default function FisherSearchBar({
  onSelect,
  resetSearch,
  selectedSpot,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Reset search when resetSearch prop changes
  useEffect(() => {
    if (resetSearch) {
      setQuery("");
      setResults([]);
    }
  }, [resetSearch]);

  // Update query when selectedSpot changes
  useEffect(() => {
    if (selectedSpot) {
      if (selectedSpot.isRegion) {
        setQuery(selectedSpot.regionName || "");
      } else {
        setQuery(selectedSpot.region || "");
      }
    }
  }, [selectedSpot]);

  const regions = [...new Set(FISHING_SPOTS.map((spot) => spot.region))].sort();
  const spotsByRegion = regions.reduce((acc, region) => {
    acc[region] = FISHING_SPOTS.filter((spot) => spot.region === region);
    return acc;
  }, {});

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const filteredRegions = regions.filter((region) =>
      region.toLowerCase().includes(query.toLowerCase())
    );

    const filteredSpots = [];
    filteredRegions.forEach((region) => {
      filteredSpots.push(...spotsByRegion[region].slice(0, 5));
    });

    setResults(filteredSpots);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCatchRateColor = (rate) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-green-400";
    if (rate >= 50) return "bg-yellow-400";
    if (rate >= 30) return "bg-orange-400";
    return "bg-red-500";
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner"
          placeholder="Search fishing regions..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => {
              setQuery("");
              setResults([]);
              onSelect(null); // Clear selection when clearing search
            }}
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-2">
            {regions
              .filter((region) =>
                region.toLowerCase().includes(query.toLowerCase())
              )
              .map((region, idx) => (
                <div key={idx} className="mb-2">
                  <div
                    className="font-medium text-gray-700 px-3 py-2 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      const regionCenter = spotsByRegion[region][0];
                      onSelect({
                        ...regionCenter,
                        isRegion: true,
                        regionName: region,
                      });
                      setIsOpen(false);
                      setQuery(region); // Set query to selected region name
                    }}
                  >
                    {region}{" "}
                    <span className="text-xs text-blue-600">
                      (Click to view region)
                    </span>
                  </div>
                  <div>
                    {spotsByRegion[region].slice(0, 5).map((spot, spotIdx) => (
                      <div
                        key={`${region}-${spotIdx}`}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => {
                          onSelect(spot);
                          setIsOpen(false);
                          setQuery(spot.region); // Set query to spot's region
                        }}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${getCatchRateColor(
                            spot.catchRate
                          )} mr-2`}
                        ></div>
                        <div>
                          <div className="text-sm">
                            {spot.fishingSpot ? "Fishing Area" : spot.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Catch rate: {spot.catchRate}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-3 text-gray-500 text-center">
            No fishing regions found
          </div>
        </div>
      )}
    </div>
  );
}
