import React, { useMemo, useState, useEffect, useRef } from "react";
import MapView from "./components/MapView";
import SearchBar from "./components/SearchBar";
import FisherSearchBar from "./components/FisherSearchBar";
import OceanDataLayers from "./components/OceanDataLayers";
import DNA3DViewer from "./components/DNA3DViewer";
import { REGIONS, SIGHTINGS } from "./data/sightingsData";
import { OCEAN_DATA } from "./data/oceanData";
import speciesList from "./data/speciesList";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [mapWidthPercent, setMapWidthPercent] = useState(65);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [reset, setReset] = useState(false);
  const [resetSearch, setResetSearch] = useState(false);
  const [showAllMarkers, setShowAllMarkers] = useState(true);
  const [activeLayer, setActiveLayer] = useState("none");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePredictResult, setImagePredictResult] = useState(null);
  const [loadingImagePredict, setLoadingImagePredict] = useState(false);
  const [otolithFile, setOtolithFile] = useState(null);
  const [otolithPreview, setOtolithPreview] = useState(null);
  const [otolithPredictResult, setOtolithPredictResult] = useState(null);
  const [loadingOtolithPredict, setLoadingOtolithPredict] = useState(false);
  const [ednaPredictResult, setEdnaPredictResult] = useState(null);
  const [loadingEdnaPredict, setLoadingEdnaPredict] = useState(false);
  const [ednaGcContent, setEdnaGcContent] = useState("");
  const [ednaDnaLength, setEdnaDnaLength] = useState("");
  const [ednaSequence, setEdnaSequence] = useState("");
  const [savedSpecies, setSavedSpecies] = useState([]);

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [viewMode, setViewMode] = useState("researcher");
  const [manualBounds, setManualBounds] = useState(null);
  const [selectedFishingSpot, setSelectedFishingSpot] = useState(null);

  async function handleImagePredict() {
    if (!imageFile) {
      setImagePredictResult({ error: "Please upload an image first." });
      return;
    }
    setLoadingImagePredict(true);
    setImagePredictResult(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res = await fetch("http://localhost:5000/classify/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setImagePredictResult({ error: data.error || "Prediction failed." });
      } else {
        setImagePredictResult(data);
        let match = null;
        if (data.speciesId) {
          match = speciesList.find((s) => s.id === data.speciesId);
        }
        if (!match && data.species) {
          const target = data.species.toLowerCase();
          match = speciesList.find(
            (s) =>
              s.name.toLowerCase() === target ||
              s.name.toLowerCase().replace("(genus)", "").trim() === target
          );
        }
        if (match) {
          setSelected(match);
          setShowAllMarkers(false);
          setIsDialogOpen(true);
        }
      }
    } catch (err) {
      setImagePredictResult({ error: "Network or server error." });
    } finally {
      setLoadingImagePredict(false);
    }
  }

  async function handleOtolithPredict() {
    if (!otolithFile) {
      setOtolithPredictResult({
        error: "Please upload an otolith image first.",
      });
      return;
    }
    setLoadingOtolithPredict(true);
    setOtolithPredictResult(null);
    try {
      const formData = new FormData();
      formData.append("image", otolithFile);
      const res = await fetch("http://localhost:5000/otolith/predict", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setOtolithPredictResult({ error: data.error || "Prediction failed." });
      } else {
        setOtolithPredictResult(data);
        let match = null;
        if (data.speciesId) {
          match = speciesList.find((s) => s.id === data.speciesId);
        }
        if (!match && data.species) {
          const target = data.species.toLowerCase();
          match = speciesList.find(
            (s) =>
              s.name.toLowerCase() === target ||
              s.name.toLowerCase().replace("(genus)", "").trim() === target
          );
        }
        if (match) {
          setSelected(match);
          setShowAllMarkers(false);
          setIsDialogOpen(true);
        }
      }
    } catch (err) {
      setOtolithPredictResult({ error: "Network or server error." });
    } finally {
      setLoadingOtolithPredict(false);
    }
  }

  async function handleEdnaPredict() {
    if (!ednaGcContent || !ednaDnaLength) {
      setEdnaPredictResult({
        error: "Please provide GC content and DNA length.",
      });
      return;
    }

    setLoadingEdnaPredict(true);
    setEdnaPredictResult(null);

    try {
      const res = await fetch("http://localhost:5000/edna/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gcContent: parseFloat(ednaGcContent),
          dnaLength: parseFloat(ednaDnaLength),
          sequence: ednaSequence,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEdnaPredictResult({ error: data.error || "Prediction failed." });
      } else {
        setEdnaPredictResult(data);
      }
    } catch (err) {
      setEdnaPredictResult({ error: "Network or server error." });
    } finally {
      setLoadingEdnaPredict(false);
    }
  }

  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const draggingRef = useRef(false);

  const isMobile = viewportWidth < 768;

  // Load saved species data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("savedSpeciesData");
    if (savedData) {
      setSavedSpecies(JSON.parse(savedData));
    }
  }, []);

  // Function to save species data
  const saveSpeciesData = (data, type) => {
    // Create a new record with timestamp and prediction type
    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: type, // 'image', 'otolith', or 'edna'
      species: data.species,
      confidence: data.confidence,
      ...data, // Include all other data from the prediction
    };

    // Add to current state
    const updatedData = [...savedSpecies, newRecord];
    setSavedSpecies(updatedData);

    // Save to localStorage
    localStorage.setItem("savedSpeciesData", JSON.stringify(updatedData));

    // Show success message
    alert("Species data saved successfully!");
  };

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (activeTab !== "image" && imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  }, [activeTab, imagePreview]);

  useEffect(() => {
    return () => {
      if (otolithPreview) {
        URL.revokeObjectURL(otolithPreview);
      }
    };
  }, [otolithPreview]);

  useEffect(() => {
    if (activeTab !== "otolith" && otolithPreview) {
      URL.revokeObjectURL(otolithPreview);
      setOtolithPreview(null);
    }
  }, [activeTab, otolithPreview]);

  const handleReset = () => {
    setSelected(null); // Clear selected species
    setSelectedFishingSpot(null); // Clear selected fishing spot
    setShowAllMarkers(true);
    setManualBounds(null); // Clear any manual bounds
    setReset(true);
    // Reset the search bar
    setResetSearch(true);
    setTimeout(() => {
      setReset(false);
      setResetSearch(false); // Reset the flag after a short delay
    }, 200);
  };

  const markers = useMemo(() => {
    if (showAllMarkers || !selected) {
      return SIGHTINGS.map((d) => {
        const species = speciesList.find((s) => s.id === d.speciesId);
        const isHighlighted = selected && d.speciesId === selected.id;
        return {
          ...d,
          color: species?.color || "#999999",
          regionName: REGIONS[d.regionKey]?.name || d.regionKey,
          isHighlighted: isHighlighted,
        };
      });
    }

    const color = selected.color;
    return SIGHTINGS.filter((d) => d.speciesId === selected.id).map((d) => ({
      ...d,
      color,
      regionName: REGIONS[d.regionKey]?.name || d.regionKey,
      isHighlighted: true,
    }));
  }, [selected, showAllMarkers]);

  const selectedRegionBounds = useMemo(() => {
    if (selected) {
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
    }
    return null;
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

  const loadCsvData = async () => {
    try {
      setCsvData([]);

      const response = await fetch("http://localhost:5000/api/marine-species");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.slice(0, 10);
    } catch (error) {
      console.error("Error fetching CSV data:", error);

      return [
        {
          regionName: "West Bengal (Bay of Bengal)",
          scientificName: "Ardeola grayii (Sykes, 1832)",
          decimalLatitude: 23.462075,
          decimalLongitude: 88.343675,
          country: "India",
          eventDate: "2025-01-02T16:50:55",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Aves",
          order: "Pelecaniformes",
          family: "Ardeidae",
          genus: "Ardeola",
          species: "Ardeola grayii",
          datasetName: "iNaturalist research-grade observations",
        },
        {
          regionName: "Kerala (Arabian Sea)",
          scientificName: "Thunnus albacares (Bonnaterre, 1788)",
          decimalLatitude: 9.9312,
          decimalLongitude: 76.2673,
          country: "India",
          eventDate: "2025-02-15T09:30:22",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Actinopterygii",
          order: "Perciformes",
          family: "Scombridae",
          genus: "Thunnus",
          species: "Thunnus albacares",
          datasetName: "Marine Research Survey",
        },
        {
          regionName: "Tamil Nadu (Bay of Bengal)",
          scientificName: "Hippocampus kuda (Bleeker, 1852)",
          decimalLatitude: 11.1271,
          decimalLongitude: 79.6791,
          country: "India",
          eventDate: "2025-03-22T14:15:30",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Actinopterygii",
          order: "Syngnathiformes",
          family: "Syngnathidae",
          genus: "Hippocampus",
          species: "Hippocampus kuda",
          datasetName: "Marine Conservation Database",
        },
        {
          regionName: "Gujarat (Arabian Sea)",
          scientificName: "Rhincodon typus (Smith, 1828)",
          decimalLatitude: 21.6417,
          decimalLongitude: 69.5316,
          country: "India",
          eventDate: "2025-04-10T07:45:12",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Chondrichthyes",
          order: "Orectolobiformes",
          family: "Rhincodontidae",
          genus: "Rhincodon",
          species: "Rhincodon typus",
          datasetName: "Shark Tracking Project",
        },
        {
          regionName: "Andaman Islands (Bay of Bengal)",
          scientificName: "Chelonia mydas (Linnaeus, 1758)",
          decimalLatitude: 11.9416,
          decimalLongitude: 92.9132,
          country: "India",
          eventDate: "2025-05-18T16:22:45",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Reptilia",
          order: "Testudines",
          family: "Cheloniidae",
          genus: "Chelonia",
          species: "Chelonia mydas",
          datasetName: "Sea Turtle Conservation",
        },
        {
          regionName: "Maharashtra (Arabian Sea)",
          scientificName: "Tursiops aduncus (Ehrenberg, 1832)",
          decimalLatitude: 18.9256,
          decimalLongitude: 72.8347,
          country: "India",
          eventDate: "2025-06-05T10:15:33",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Mammalia",
          order: "Cetacea",
          family: "Delphinidae",
          genus: "Tursiops",
          species: "Tursiops aduncus",
          datasetName: "Marine Mammal Survey",
        },
        {
          regionName: "Odisha (Bay of Bengal)",
          scientificName: "Lepidochelys olivacea (Eschscholtz, 1829)",
          decimalLatitude: 19.8135,
          decimalLongitude: 85.8312,
          country: "India",
          eventDate: "2025-01-15T05:30:00",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Reptilia",
          order: "Testudines",
          family: "Cheloniidae",
          genus: "Lepidochelys",
          species: "Lepidochelys olivacea",
          datasetName: "Arribada Monitoring Program",
        },
        {
          regionName: "Lakshadweep (Arabian Sea)",
          scientificName: "Acropora muricata (Linnaeus, 1758)",
          decimalLatitude: 10.5667,
          decimalLongitude: 72.6417,
          country: "India",
          eventDate: "2025-02-28T11:45:22",
          kingdom: "Animalia",
          phylum: "Cnidaria",
          class: "Anthozoa",
          order: "Scleractinia",
          family: "Acroporidae",
          genus: "Acropora",
          species: "Acropora muricata",
          datasetName: "Coral Reef Assessment",
        },
        {
          regionName: "Goa (Arabian Sea)",
          scientificName: "Octopus cyanea (Gray, 1849)",
          decimalLatitude: 15.2993,
          decimalLongitude: 73.984,
          country: "India",
          eventDate: "2025-03-14T16:20:45",
          kingdom: "Animalia",
          phylum: "Mollusca",
          class: "Cephalopoda",
          order: "Octopoda",
          family: "Octopodidae",
          genus: "Octopus",
          species: "Octopus cyanea",
          datasetName: "Cephalopod Diversity Study",
        },
        {
          regionName: "Karnataka (Arabian Sea)",
          scientificName: "Neophocaena phocaenoides (G. Cuvier, 1829)",
          decimalLatitude: 12.8698,
          decimalLongitude: 74.8383,
          country: "India",
          eventDate: "2025-05-22T08:10:33",
          kingdom: "Animalia",
          phylum: "Chordata",
          class: "Mammalia",
          order: "Cetacea",
          family: "Phocoenidae",
          genus: "Neophocaena",
          species: "Neophocaena phocaenoides",
          datasetName: "Cetacean Monitoring Network",
        },
      ];
    }
  };

  const handleDownloadCsv = () => {
    if (!csvData || csvData.length === 0) return;

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) => {
      return Object.values(row)
        .map((value) => {
          if (String(value).includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "marine_species_data.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const DatabaseModal = ({
    isOpen,
    onClose,
    data,
    onDownload,
    savedSpecies,
    setSavedSpecies,
  }) => {
    if (!isOpen) return null;

    const isLoading = !data || data.length === 0;
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

    const handleSort = (column) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    };
    const sortedData = React.useMemo(() => {
      if (!data || !sortColumn) return data;

      return [...data].sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];

        if (!isNaN(valueA) && !isNaN(valueB)) {
          return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
        }

        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();

        if (sortDirection === "asc") {
          return strA.localeCompare(strB);
        } else {
          return strB.localeCompare(strA);
        }
      });
    }, [data, sortColumn, sortDirection]);

    const downloadSavedSpecies = () => {
      if (!savedSpecies || savedSpecies.length === 0) {
        alert("No saved species data to download");
        return;
      }

      // Format data for CSV
      const csvData = savedSpecies.map((item) => {
        return {
          Species: item.species,
          Type: item.type,
          Confidence: (item.confidence * 100).toFixed(2) + "%",
          Date: new Date(item.timestamp).toLocaleString(),
        };
      });

      // Generate CSV
      const headers = Object.keys(csvData[0]);
      const csv = [
        headers.join(","),
        ...csvData.map((row) =>
          headers
            .map((key) => {
              // Handle commas and quotes in the data
              const value = row[key] || "";
              if (value.includes(",") || value.includes('"')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(",")
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "saved_species_data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const [activeSection, setActiveSection] = useState("data");

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Marine Species Database
              </h2>
              {!isLoading && (
                <p className="text-sm text-gray-500">
                  Showing 10 species from the database
                </p>
              )}
            </div>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Section tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeSection === "info"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSection("info")}
            >
              Species Info
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeSection === "data"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSection("data")}
            >
              Species Data
            </button>
          </div>

          <div
            className="flex-grow p-2"
            style={{ overflow: "auto", maxHeight: "calc(90vh - 200px)" }}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">
                  Loading marine species data...
                </p>
              </div>
            ) : activeSection === "info" ? (
              <div className="p-4">
                {savedSpecies && savedSpecies.length > 0 ? (
                  <div>
                    <table className="w-full divide-y divide-gray-200 table-auto">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Species
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Detection Type
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Confidence
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date Saved
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {savedSpecies.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {item.species}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700 capitalize">
                              {item.type === "image"
                                ? "Image Classification"
                                : item.type === "otolith"
                                ? "Otolith Analysis"
                                : "eDNA Classification"}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {(item.confidence * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {new Date(item.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="mb-2">No saved species data found.</p>
                    <p className="text-sm">
                      Use the "Save Data" button after predictions to save
                      species information.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ overflow: "auto" }}>
                <table className="w-full divide-y divide-gray-200 table-auto">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {data.length > 0 &&
                        Object.keys(data[0]).map((column, idx) => (
                          <th
                            key={idx}
                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                            onClick={() => handleSort(column)}
                          >
                            <div className="flex items-center">
                              <span>{column}</span>
                              {sortColumn === column && (
                                <span className="ml-1">
                                  {sortDirection === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {Object.values(row).map((value, valIdx) => (
                          <td
                            key={valIdx}
                            className="px-4 py-2 text-sm text-gray-700"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {!isLoading && activeSection === "data" && (
                <span>Showing 10 rows from the marine species database</span>
              )}
              {activeSection === "info" && savedSpecies && (
                <span>Showing {savedSpecies.length} saved species records</span>
              )}
            </div>

            {activeSection === "data" ? (
              <button
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center gap-2"
                onClick={onDownload}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download CSV
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center gap-2"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to clear all saved species data? This action cannot be undone."
                      )
                    ) {
                      localStorage.removeItem("savedSpeciesData");
                      setSavedSpecies([]);
                    }
                  }}
                  disabled={!savedSpecies || savedSpecies.length === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Clear Data
                </button>

                <button
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center gap-2"
                  onClick={downloadSavedSpecies}
                  disabled={!savedSpecies || savedSpecies.length === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Download CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "search", label: "Search" },
    { id: "image", label: "Image Prediction" },
    { id: "otolith", label: "Otolith Classification" },
    { id: "edna", label: "eDNA Classification" },
  ];

  return (
    <div className="h-screen w-screen bg-gray-50 text-gray-900 overflow-hidden flex flex-col font-sans">
      <header className="w-full p-4 flex items-center justify-between bg-white shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-5xl">🌎</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800">
              SamudraNet
            </h1>
            <p className="text-sm md:text-base text-gray-500 -mt-1">
              Marine Species Mapper
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/api/docs"
            target="_blank"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            Documentation
          </a>
          <button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition-colors duration-200 flex items-center gap-2"
            onClick={async () => {
              setIsDbModalOpen(true);
              const data = await loadCsvData();
              setCsvData(data);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
              <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
              <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
            </svg>
            Database
          </button>
        </div>
      </header>
      <div
        ref={containerRef}
        className={`flex flex-1 ${
          isMobile ? "flex-col" : "flex-row"
        } overflow-hidden`}
      >
        <div
          className="transition-all duration-300 ease-in-out p-3 md:p-5"
          style={{
            flexBasis: isMobile ? "50%" : `${mapWidthPercent}%`,
            height: isMobile ? "50vh" : "auto",
            minHeight: isMobile ? "300px" : "auto",
          }}
        >
          <div className="h-full w-full rounded-xl overflow-hidden shadow-xl border border-gray-200 bg-gray-800/10 backdrop-blur-sm">
            <MapView
              markers={markers}
              selectedRegionBounds={manualBounds || selectedRegionBounds}
              onResetMarkers={handleReset}
              triggerReset={reset}
              isMobile={isMobile}
              activeLayer={activeLayer}
              viewMode={viewMode}
            />
          </div>
        </div>
        {!isMobile && (
          <div
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            className="w-1 cursor-col-resize bg-gray-300 hover:bg-gray-500 transition-colors duration-200"
          />
        )}
        <div
          className="transition-all duration-300 ease-in-out flex flex-col gap-4 p-4 md:p-6 bg-gray-100 custom-scrollbar"
          style={{
            flexGrow: 1,
            flexShrink: 0,
            height: isMobile ? "50vh" : "100%",
            overflowY: "auto",
          }}
        >
          <div className="flex gap-2 flex-wrap justify-center bg-white rounded-xl p-2 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm md:text-base transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                aria-label={tab.label}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "search" && (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {viewMode === "researcher"
                    ? "Search Species"
                    : "Fishing Spots"}
                </h2>
                <div className="relative">
                  <select
                    className="appearance-none bg-blue-50 border border-blue-200 text-blue-800 py-1 px-3 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:cursor-pointer"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                  >
                    <option value="researcher">Researcher's View</option>
                    <option value="fisher">Fisher's View</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-800">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {viewMode === "researcher" ? (
                <>
                  <SearchBar
                    onSelect={(s) => {
                      setSelected(s);
                      setShowAllMarkers(false);
                    }}
                    resetSearch={resetSearch}
                  />
                  <div className="mt-3 text-center text-sm text-gray-600">
                    Search by{" "}
                    <span className="font-semibold">scientific name</span>.
                    Select a result to plot sightings.
                  </div>
                </>
              ) : (
                <>
                  <FisherSearchBar
                    selectedSpot={selectedFishingSpot}
                    resetSearch={resetSearch}
                    onSelect={(spot) => {
                      // Save the selected spot
                      setSelectedFishingSpot(spot);

                      // Handle selection of fishing spot or region
                      if (spot.isRegion) {
                        // For regions, use a wider zoom to show the entire state
                        const bounds = [
                          [spot.lat - 1.5, spot.lng - 1.5], // Use wider bounds for regions
                          [spot.lat + 1.5, spot.lng + 1.5],
                        ];
                        setManualBounds(bounds);
                      } else {
                        // For individual fishing spots, use a tighter zoom
                        const bounds = [
                          [spot.lat - 0.05, spot.lng - 0.05],
                          [spot.lat + 0.05, spot.lng + 0.05],
                        ];
                        setManualBounds(bounds);
                      }
                    }}
                  />
                  <div className="mt-3 text-center text-sm text-gray-600">
                    Search by{" "}
                    <span className="font-semibold">fishing region</span>.
                    Select a fishing spot to view details.
                  </div>
                </>
              )}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Open Ocean Data"
                >
                  Ocean Data Layers
                </button>
              </div>
            </div>
          )}

          {activeTab === "image" && (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Predict by Image Data
              </h2>
              <p className="text-gray-600 mb-4">
                Upload an image to predict marine species using AI.
              </p>
              <input
                type="file"
                accept="image/*"
                className="mb-4 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImageFile(file);
                    const previewUrl = URL.createObjectURL(file);
                    setImagePreview(previewUrl);
                  }
                }}
              />
              {imagePreview && (
                <div className="mb-4 flex justify-start">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Image Preview"
                      className="max-h-48 max-w-xs object-contain rounded-lg border border-gray-300 shadow-sm"
                      style={{ maxWidth: "200px" }}
                    />
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none"
                      onClick={() => {
                        URL.revokeObjectURL(imagePreview);
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <button
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleImagePredict}
                disabled={loadingImagePredict}
              >
                {loadingImagePredict ? "Predicting..." : "Predict"}
              </button>
              {imagePredictResult && (
                <div className="mt-6">
                  <div className="mb-2 text-lg font-semibold text-green-700">
                    Predicted Species: {imagePredictResult.species}
                  </div>
                  <div className="mb-2 text-gray-700">
                    Confidence:{" "}
                    {(imagePredictResult.confidence * 100).toFixed(2)}%
                  </div>
                  {imagePredictResult.visualization && (
                    <img
                      src={`data:image/png;base64,${imagePredictResult.visualization}`}
                      alt="PCA/t-SNE Visualization"
                      className="w-full max-w-md rounded-lg border border-gray-300 shadow mt-4"
                    />
                  )}
                  {imagePredictResult.error && (
                    <div className="text-red-600 mt-2">
                      {imagePredictResult.error}
                    </div>
                  )}
                  {!imagePredictResult.error && (
                    <button
                      onClick={() =>
                        saveSpeciesData(imagePredictResult, "image")
                      }
                      className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                      </svg>
                      Save Data
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "otolith" && (
            <div
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200 custom-scrollbar"
              style={{ width: "100%", maxWidth: "100%", overflow: "auto" }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Otolith Classification
              </h2>
              <p className="text-gray-600 mb-4">
                Classify fish species using otolith (ear bone) images.
              </p>
              <input
                type="file"
                accept="image/*"
                className="mb-4 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setOtolithFile(file);
                    // Generate preview URL
                    const previewUrl = URL.createObjectURL(file);
                    setOtolithPreview(previewUrl);
                  }
                }}
              />
              {otolithPreview && (
                <div className="mb-4 flex justify-start">
                  <div className="relative inline-block">
                    <img
                      src={otolithPreview}
                      alt="Otolith Preview"
                      className="max-h-48 max-w-xs object-contain rounded-lg border border-gray-300 shadow-sm"
                      style={{ maxWidth: "200px" }}
                    />
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 focus:outline-none"
                      onClick={() => {
                        URL.revokeObjectURL(otolithPreview);
                        setOtolithPreview(null);
                        setOtolithFile(null);
                      }}
                      title="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              <button
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleOtolithPredict}
                disabled={loadingOtolithPredict}
              >
                {loadingOtolithPredict ? "Classifying..." : "Classify"}
              </button>
              {otolithPredictResult && (
                <div
                  className="mt-6 custom-scrollbar"
                  style={{
                    width: "100%",
                    maxWidth: "100%",
                    overflow: "auto",
                  }}
                >
                  {otolithPredictResult.error ? (
                    <div className="text-red-600 mt-2">
                      {otolithPredictResult.error}
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-lg font-semibold text-green-700">
                        Predicted Species: {otolithPredictResult.species}
                      </div>
                      <div className="mb-2 text-gray-700">
                        Confidence:{" "}
                        {(otolithPredictResult.confidence * 100).toFixed(2)}%
                      </div>
                      <div
                        className="flex flex-col md:flex-row gap-4 mt-4 custom-scrollbar"
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          overflow: "auto",
                        }}
                      >
                        <div
                          className="border border-gray-300 rounded-lg p-2 shadow"
                          style={{ maxWidth: "48%", flex: "1 0 auto" }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-medium text-gray-800">
                              2D Segmentation
                            </h3>
                            <div className="flex gap-1">
                              <a
                                href={`data:image/png;base64,${otolithPredictResult.visualization2d}`}
                                download="otolith_2d.png"
                                className="p-1 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                title="Download"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                              </a>
                            </div>
                          </div>
                          <div
                            className="overflow-auto relative custom-scrollbar"
                            style={{ height: "200px", maxWidth: "100%" }}
                          >
                            <img
                              src={`data:image/png;base64,${otolithPredictResult.visualization2d}`}
                              alt="2D Otolith Segmentation"
                              className="h-full object-contain cursor-zoom-in transform transition-transform duration-200"
                              style={{ maxWidth: "100%", width: "auto" }}
                              onClick={(e) => {
                                const currentScale = e.target.style.transform
                                  ? parseFloat(
                                      e.target.style.transform.replace(
                                        /scale\((.+)\)/,
                                        "$1"
                                      )
                                    )
                                  : 1;
                                e.target.style.transform =
                                  currentScale === 1
                                    ? "scale(1.75)"
                                    : "scale(1)";
                                e.target.classList.toggle("cursor-zoom-in");
                                e.target.classList.toggle("cursor-zoom-out");
                              }}
                            />
                          </div>
                        </div>
                        <div
                          className="border border-gray-300 rounded-lg p-2 shadow"
                          style={{ maxWidth: "48%", flex: "1 0 auto" }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-medium text-gray-800">
                              3D Reconstruction
                            </h3>
                            <div className="flex gap-1">
                              <a
                                href={`data:image/png;base64,${otolithPredictResult.visualization3d}`}
                                download="otolith_3d.png"
                                className="p-1 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                title="Download"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                              </a>
                            </div>
                          </div>
                          <div
                            className="overflow-auto relative custom-scrollbar"
                            style={{ height: "200px", maxWidth: "100%" }}
                          >
                            <img
                              src={`data:image/png;base64,${otolithPredictResult.visualization3d}`}
                              alt="3D Otolith Reconstruction"
                              className="h-full object-contain"
                              style={{ maxWidth: "100%", width: "auto" }}
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-white bg-gray-800 rounded-lg px-2 py-1 opacity-80">
                              Click "View Oceanographic Data" for 3D rotation
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="mt-4 border border-gray-300 rounded-lg p-2 shadow custom-scrollbar"
                        style={{
                          width: "100%",
                          maxWidth: "100%",
                          boxSizing: "border-box",
                          overflow: "auto",
                        }}
                      >
                        <h3 className="text-md font-medium text-gray-800 mb-2">
                          Confidence Assessment
                        </h3>
                        <img
                          src={`data:image/png;base64,${otolithPredictResult.confidenceViz}`}
                          alt="Confidence Visualization"
                          className="rounded-lg"
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: "200px",
                            maxWidth: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div className="mt-4 text-center w-full max-w-full flex gap-4 justify-center">
                        <button
                          onClick={() => {
                            setIsDialogOpen(true);
                            if (
                              selected &&
                              selected.id === "setipinna_tenuifilis"
                            ) {
                            } else {
                              const match = speciesList.find(
                                (s) => s.id === "setipinna_tenuifilis"
                              );
                              if (match) setSelected(match);
                            }
                          }}
                          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          View 3D Interactive Model
                        </button>

                        <button
                          onClick={() =>
                            saveSpeciesData(otolithPredictResult, "otolith")
                          }
                          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                          </svg>
                          Save Data
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "edna" && (
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                eDNA Classification
              </h2>
              <p className="text-gray-600 mb-4">
                Classify marine species using eDNA sequence data.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GC Content (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ednaGcContent}
                    onChange={(e) => setEdnaGcContent(e.target.value)}
                    placeholder="e.g., 45.5"
                    style={{ backgroundColor: "white", color: "#1a1a1a" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DNA Length (bp)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ednaDnaLength}
                    onChange={(e) => setEdnaDnaLength(e.target.value)}
                    placeholder="e.g., 1200"
                    style={{ backgroundColor: "white", color: "#1a1a1a" }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNA Sequence (optional)
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  rows={4}
                  value={ednaSequence}
                  onChange={(e) => setEdnaSequence(e.target.value)}
                  placeholder="e.g., ATGCTAGCTAGCTAGCTAGC..."
                  style={{ backgroundColor: "white", color: "#1a1a1a" }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide ATGC sequence if available. Only required fields are
                  GC content and DNA length.
                </p>
              </div>

              <button
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleEdnaPredict}
                disabled={loadingEdnaPredict}
              >
                {loadingEdnaPredict ? "Classifying..." : "Classify Species"}
              </button>

              {ednaPredictResult && (
                <div className="mt-6">
                  {ednaPredictResult.error ? (
                    <div className="text-red-600 mt-2">
                      {ednaPredictResult.error}
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-lg font-semibold text-green-700">
                        Predicted Species: {ednaPredictResult.species}
                      </div>
                      <div className="mb-2 text-gray-700">
                        Confidence:{" "}
                        {(ednaPredictResult.confidence * 100).toFixed(2)}%
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="border border-gray-300 rounded-lg p-2 shadow">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-medium text-gray-800">
                              DNA Analysis
                            </h3>
                            <div className="flex gap-1">
                              <a
                                href={`data:image/png;base64,${ednaPredictResult.dnaAnalysisViz}`}
                                download="dna_analysis.png"
                                className="p-1 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                title="Download"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                              </a>
                            </div>
                          </div>
                          <div
                            className="overflow-hidden relative"
                            style={{ height: "250px" }}
                          >
                            <img
                              src={`data:image/png;base64,${ednaPredictResult.dnaAnalysisViz}`}
                              alt="DNA Analysis Visualization"
                              className="w-full h-full object-contain cursor-zoom-in transform transition-transform duration-200"
                              onClick={(e) => {
                                const currentScale = e.target.style.transform
                                  ? parseFloat(
                                      e.target.style.transform.replace(
                                        /scale\((.+)\)/,
                                        "$1"
                                      )
                                    )
                                  : 1;
                                e.target.style.transform =
                                  currentScale === 1
                                    ? "scale(1.75)"
                                    : "scale(1)";
                                e.target.classList.toggle("cursor-zoom-in");
                                e.target.classList.toggle("cursor-zoom-out");
                              }}
                            />
                          </div>
                        </div>
                        <div className="border border-gray-300 rounded-lg p-2 shadow">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-medium text-gray-800">
                              Species Similarity
                            </h3>
                            <div className="flex gap-1">
                              <a
                                href={`data:image/png;base64,${ednaPredictResult.similarityViz}`}
                                download="species_similarity.png"
                                className="p-1 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                                title="Download"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                              </a>
                            </div>
                          </div>
                          <div
                            className="overflow-hidden relative"
                            style={{ height: "250px" }}
                          >
                            <img
                              src={`data:image/png;base64,${ednaPredictResult.similarityViz}`}
                              alt="Species Similarity Analysis"
                              className="w-full h-full object-contain cursor-zoom-in transform transition-transform duration-200"
                              onClick={(e) => {
                                const currentScale = e.target.style.transform
                                  ? parseFloat(
                                      e.target.style.transform.replace(
                                        /scale\((.+)\)/,
                                        "$1"
                                      )
                                    )
                                  : 1;
                                e.target.style.transform =
                                  currentScale === 1
                                    ? "scale(1.75)"
                                    : "scale(1)";
                                e.target.classList.toggle("cursor-zoom-in");
                                e.target.classList.toggle("cursor-zoom-out");
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="border border-gray-300 rounded-lg p-2 shadow">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-md font-semibold text-gray-800">
                              Interactive 3D DNA Model
                            </h3>
                            <div className="flex gap-1">
                              <div
                                className="p-1 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Full Screen"
                                onClick={() => {
                                  const container = document.getElementById(
                                    "dna-viewer-container"
                                  );
                                  if (container) {
                                    if (document.fullscreenElement) {
                                      document.exitFullscreen();
                                    } else {
                                      container.requestFullscreen();
                                    }
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                                  />
                                </svg>
                              </div>
                              <div
                                className="p-1 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer"
                                title="Reset View"
                                onClick={() => {
                                  // Force remount by changing a key prop
                                  const container = document.getElementById(
                                    "dna-viewer-container"
                                  );
                                  if (container) {
                                    container.innerHTML = "";
                                    // Force remount by toggling a class
                                    container.classList.toggle("reset-view");
                                    setTimeout(() => {
                                      container.classList.toggle("reset-view");
                                    }, 100);
                                  }
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div
                            id="dna-viewer-container"
                            className="relative bg-gradient-to-b from-blue-100 to-blue-200 border-2 border-blue-300 rounded-md"
                            style={{ height: "500px" }}
                          >
                            <DNA3DViewer
                              sequence={
                                ednaSequence || ednaPredictResult?.sequence
                              }
                              gcContent={
                                ednaGcContent || ednaPredictResult?.gcContent
                              }
                              dnaLength={
                                ednaDnaLength || ednaPredictResult?.dnaLength
                              }
                            />
                            <div className="absolute bottom-2 right-2 text-xs text-white bg-gray-800 rounded-lg px-2 py-1 opacity-80">
                              Click to toggle rotation | Drag to rotate | Scroll
                              to zoom
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                            <div className="font-semibold mb-1 text-gray-700">
                              DNA Model Information:
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span>Adenine (A)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span>Thymine (T)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <span>Guanine (G)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Cytosine (C)</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              <span className="font-medium">GC Content:</span>{" "}
                              {ednaGcContent ||
                                ednaPredictResult?.gcContent ||
                                "50"}
                              % |
                              <span className="font-medium"> DNA Length:</span>{" "}
                              {ednaDnaLength ||
                                ednaPredictResult?.dnaLength ||
                                "1000"}{" "}
                              bp
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 text-center">
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-semibold">GC Content:</span>{" "}
                          {ednaPredictResult.gcContent}% |
                          <span className="font-semibold"> DNA Length:</span>{" "}
                          {ednaPredictResult.dnaLength} bp
                          {ednaPredictResult.sequence && (
                            <>
                              {" "}
                              | <span className="font-semibold">
                                Sequence:
                              </span>{" "}
                              {ednaPredictResult.sequence.substring(0, 20)}...
                            </>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            saveSpeciesData(ednaPredictResult, "edna")
                          }
                          className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 mx-auto"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H8a2 2 0 01-2-2v-7a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                          </svg>
                          Save Data
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

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
              showModelViz={!!imagePredictResult}
              predictResult={imagePredictResult}
              otolithResult={otolithPredictResult}
              ednaResult={ednaPredictResult}
              activeTab={activeTab}
            />
          )}
        </div>
      </div>

      <DatabaseModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        data={csvData}
        onDownload={handleDownloadCsv}
        savedSpecies={savedSpecies}
        setSavedSpecies={setSavedSpecies}
      />
    </div>
  );
}
