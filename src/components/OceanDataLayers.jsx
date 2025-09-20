import { useState } from "react";
import OceanDataTile from "./OceanDataTile";

export default function OceanDataDialog({
  onLayerChange,
  visibleRegions,
  isOpen,
  onClose,
  showModelViz = false,
  predictResult = null,
  otolithResult = null,
  ednaResult = null,
  activeTab = null,
}) {
  const [activeLayer, setActiveLayer] = useState("none");
  const [selectedTab, setSelectedTab] = useState("temperature");
  const handleLayerChange = (type) => {
    const newLayer = activeLayer === type ? "none" : type;
    setActiveLayer(newLayer);
    onLayerChange(newLayer);
  };

  const getAggregatedData = (type) => {
    const allPoints = [];
    Object.values(visibleRegions).forEach((region) => {
      if (region[type]) {
        allPoints.push(...region[type].points);
      }
    });
    return allPoints.length > 0 ? { points: allPoints } : null;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const tabs = [
    { id: "temperature", label: "Temperature", icon: "🌡️" },
    { id: "salinity", label: "Salinity", icon: "🧂" },
    { id: "ph", label: "pH Level", icon: "⚗️" },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Oceanographic Data
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore ocean conditions and measurements
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
            aria-label="Close dialog"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {(activeTab === "search" || activeTab === null) && (
          <div className="border-b border-slate-200">
            <nav className="flex space-x-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? "border-blue-500 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className="p-6 overflow-auto max-h-[calc(90vh-180px)]">
          {(activeTab === "search" || activeTab === null) && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <OceanDataTile
                  type={selectedTab}
                  data={getAggregatedData(selectedTab)}
                  isActive={activeLayer === selectedTab}
                  onClick={handleLayerChange}
                />
              </div>
            </div>
          )}

          {showModelViz &&
            predictResult?.visualization &&
            (activeTab === "image" || activeTab === null) && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  Model Visualization (PCA & t-SNE)
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  Projection of the predicted image embedding compared to nearby
                  samples.
                </p>
                <img
                  src={`data:image/png;base64,${predictResult.visualization}`}
                  alt="PCA and t-SNE visualization"
                  className="w-full max-w-2xl rounded-lg border border-slate-200 shadow"
                />
              </div>
            )}

          {otolithResult && (activeTab === "otolith" || activeTab === null) && (
            <div className="mt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Otolith Classification Results
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                2D and 3D representations of the classified otolith.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border border-slate-200 rounded-lg p-2 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-slate-900">
                      2D Segmentation
                    </h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const modal = document.createElement("div");
                          modal.className =
                            "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";
                          modal.innerHTML = `
                            <div class="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg">
                              <button class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center">×</button>
                              <img 
                                src="data:image/png;base64,${otolithResult.visualization2d}" 
                                class="max-w-full max-h-[85vh] object-contain"
                                style="transform-origin: center center;"
                              />
                              <div class="absolute bottom-4 right-4 flex space-x-2 bg-white bg-opacity-75 rounded-lg p-2">
                                <button class="p-2 bg-blue-500 text-white rounded">+</button>
                                <button class="p-2 bg-blue-500 text-white rounded">−</button>
                                <button class="p-2 bg-blue-500 text-white rounded">↺</button>
                                <a class="p-2 bg-green-500 text-white rounded" href="data:image/png;base64,${otolithResult.visualization2d}" download="otolith_2d.png">⬇</a>
                              </div>
                            </div>
                          `;
                          document.body.appendChild(modal);

                          const closeBtn = modal.querySelector("button");
                          closeBtn.addEventListener("click", () => {
                            document.body.removeChild(modal);
                          });

                          const img = modal.querySelector("img");
                          const zoomInBtn = modal.querySelectorAll("button")[1];
                          const zoomOutBtn =
                            modal.querySelectorAll("button")[2];
                          const resetBtn = modal.querySelectorAll("button")[3];

                          let scale = 1;

                          zoomInBtn.addEventListener("click", () => {
                            scale = Math.min(scale + 0.25, 3);
                            img.style.transform = `scale(${scale})`;
                          });

                          zoomOutBtn.addEventListener("click", () => {
                            scale = Math.max(scale - 0.25, 0.5);
                            img.style.transform = `scale(${scale})`;
                          });

                          resetBtn.addEventListener("click", () => {
                            scale = 1;
                            img.style.transform = `scale(${scale})`;
                          });
                        }}
                        className="p-1 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                        title="Fullscreen"
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
                      </button>
                      <a
                        href={`data:image/png;base64,${otolithResult.visualization2d}`}
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
                    className="overflow-hidden relative"
                    style={{ height: "300px" }}
                  >
                    <img
                      src={`data:image/png;base64,${otolithResult.visualization2d}`}
                      alt="2D Otolith Segmentation"
                      className="w-full h-full object-contain cursor-pointer"
                      onClick={(e) => {
                        const img = e.target;
                        const transform = img.style.transform || "";
                        img.style.transform =
                          transform === "scale(1.75)" ? "" : "scale(1.75)";
                      }}
                      title="Click to zoom"
                    />
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-2 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-slate-900">
                      3D Reconstruction
                    </h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const modal = document.createElement("div");
                          modal.className =
                            "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";

                          const carouselImages =
                            otolithResult.visualization3dViews
                              ? otolithResult.visualization3dViews
                                  .map(
                                    (img) =>
                                      `<img src="data:image/png;base64,${img}" class="max-w-full max-h-[85vh] object-contain hidden carousel-item"/>`
                                  )
                                  .join("")
                              : `<img src="data:image/png;base64,${otolithResult.visualization3d}" class="max-w-full max-h-[85vh] object-contain carousel-item"/>`;

                          modal.innerHTML = `
                            <div class="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg">
                              <button class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center z-20">×</button>
                              
                              <div class="carousel-container relative">
                                ${carouselImages}
                                
                                <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
                                
                                <div class="absolute inset-x-0 top-1/2 flex justify-between items-center transform -translate-y-1/2 px-4 z-10">
                                  <button class="rotate-left p-3 bg-white bg-opacity-75 rounded-full shadow hover:bg-blue-100 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                  <button class="rotate-right p-3 bg-white bg-opacity-75 rounded-full shadow hover:bg-blue-100 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                </div>
                                
                                <div class="absolute top-2 left-2 bg-white bg-opacity-75 px-3 py-1 rounded-full text-blue-800 font-mono text-sm flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  <span class="angle-indicator">0°</span>
                                </div>
                              </div>
                              
                              <div class="mt-4 flex justify-between items-center">
                                <div class="text-sm text-gray-600">
                                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Drag horizontally</span> or 
                                  <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded mx-2">use arrow keys</span> to rotate model
                                </div>
                                <a class="p-2 bg-green-500 text-white rounded" href="data:image/png;base64,${otolithResult.visualization3d}" download="otolith_3d.png">Download</a>
                              </div>
                            </div>
                          `;

                          document.body.appendChild(modal);

                          // Set up carousel functionality
                          const items =
                            modal.querySelectorAll(".carousel-item");
                          if (items.length > 0) {
                            items[0].classList.remove("hidden"); // Show first item

                            let currentIndex = 0;
                            let isDragging = false;
                            let startX = 0;
                            let startY = 0;

                            const showItem = (index) => {
                              // Handle wrapping around
                              if (index < 0) index = items.length - 1;
                              if (index >= items.length) index = 0;

                              // Hide all items
                              items.forEach((item) =>
                                item.classList.add("hidden")
                              );
                              // Show current item
                              items[index].classList.remove("hidden");
                              currentIndex = index;

                              // Update angle indicator
                              const angleIndicator =
                                modal.querySelector(".angle-indicator");
                              if (angleIndicator) {
                                // Convert index to degrees (assuming 8 views = 360 degrees)
                                const degrees = Math.floor(
                                  index * (360 / items.length)
                                );
                                angleIndicator.textContent = `${degrees}°`;
                              }
                            };

                            // Set up rotation buttons
                            const rotateLeft =
                              modal.querySelector(".rotate-left");
                            const rotateRight =
                              modal.querySelector(".rotate-right");

                            rotateLeft.addEventListener("click", () => {
                              showItem(currentIndex - 1);
                            });

                            rotateRight.addEventListener("click", () => {
                              showItem(currentIndex + 1);
                            });

                            // Mouse/touch drag to rotate
                            const container = modal.querySelector(
                              ".carousel-container"
                            );

                            // Add grab cursor styles
                            container.style.cursor = "grab";

                            container.addEventListener("mousedown", (e) => {
                              isDragging = true;
                              startX = e.clientX;
                              container.style.cursor = "grabbing";
                            });

                            container.addEventListener("touchstart", (e) => {
                              isDragging = true;
                              startX = e.touches[0].clientX;
                              container.style.cursor = "grabbing";
                            });

                            container.addEventListener("mousemove", (e) => {
                              if (!isDragging) return;

                              const deltaX = e.clientX - startX;
                              if (Math.abs(deltaX) > 50) {
                                if (deltaX > 0) {
                                  showItem(currentIndex - 1); // Right drag -> left rotation
                                } else {
                                  showItem(currentIndex + 1); // Left drag -> right rotation
                                }
                                startX = e.clientX; // Reset start position for continuous dragging
                                isDragging = true; // Keep dragging
                              }
                            });

                            container.addEventListener("touchmove", (e) => {
                              if (!isDragging) return;

                              const deltaX = e.touches[0].clientX - startX;
                              if (Math.abs(deltaX) > 50) {
                                if (deltaX > 0) {
                                  showItem(currentIndex - 1); // Right drag -> left rotation
                                } else {
                                  showItem(currentIndex + 1); // Left drag -> right rotation
                                }
                                startX = e.touches[0].clientX; // Reset start position for continuous dragging
                                isDragging = true; // Keep dragging
                              }
                            });

                            container.addEventListener("mouseup", () => {
                              isDragging = false;
                              container.style.cursor = "grab";
                            });

                            container.addEventListener("touchend", () => {
                              isDragging = false;
                              container.style.cursor = "grab";
                            });

                            // Add auto-rotation feature with controls
                            let autoRotateInterval = null;
                            let isAutoRotating = false;

                            // Add auto-rotate button
                            const controlsDiv = modal.querySelector(".mt-4");
                            const autoRotateBtn =
                              document.createElement("button");
                            autoRotateBtn.className =
                              "p-2 bg-blue-500 text-white rounded mx-2";
                            autoRotateBtn.innerHTML = "Auto-Rotate";
                            autoRotateBtn.addEventListener("click", () => {
                              if (isAutoRotating) {
                                clearInterval(autoRotateInterval);
                                autoRotateBtn.innerHTML = "Auto-Rotate";
                                isAutoRotating = false;
                              } else {
                                autoRotateInterval = setInterval(() => {
                                  showItem(currentIndex + 1);
                                }, 1000);
                                autoRotateBtn.innerHTML = "Stop Rotation";
                                isAutoRotating = true;
                              }
                            });

                            // Insert before the download button
                            controlsDiv.insertBefore(
                              autoRotateBtn,
                              controlsDiv.lastElementChild
                            );

                            // Keyboard arrow keys
                            window.addEventListener("keydown", function (e) {
                              if (e.key === "ArrowLeft") {
                                showItem(currentIndex - 1);
                              } else if (e.key === "ArrowRight") {
                                showItem(currentIndex + 1);
                              }
                            });
                          }

                          // Set up close button
                          const closeBtn = modal.querySelector("button");
                          closeBtn.addEventListener("click", () => {
                            document.body.removeChild(modal);
                          });
                        }}
                        className="p-1 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                        title="3D View"
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
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      <a
                        href={`data:image/png;base64,${otolithResult.visualization3d}`}
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
                    className="overflow-hidden relative"
                    style={{ height: "300px" }}
                  >
                    <img
                      src={`data:image/png;base64,${otolithResult.visualization3d}`}
                      alt="3D Otolith Reconstruction"
                      className="w-full h-full object-contain cursor-move"
                      title="Click to interact in 3D"
                      onClick={(e) => {
                        const button = e.target
                          .closest("div")
                          .previousSibling.querySelector("button");
                        button.click();
                      }}
                    />
                    <div className="absolute bottom-2 right-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                      Click for interactive 3D rotation
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 hover:opacity-0 transition-opacity duration-300">
                      <div className="bg-black bg-opacity-30 text-white px-4 py-2 rounded-full text-sm font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 inline mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                          />
                        </svg>
                        Interactive 3D Model
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 border border-slate-200 rounded-lg p-2 shadow">
                <h4 className="text-sm font-medium text-slate-900 mb-2">
                  Confidence Assessment
                </h4>
                <img
                  src={`data:image/png;base64,${otolithResult.confidenceViz}`}
                  alt="Confidence Visualization"
                  className="w-full rounded-lg max-w-md mx-auto"
                />
              </div>
            </div>
          )}

          {ednaResult && (activeTab === "edna" || activeTab === null) && (
            <div className="mt-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                eDNA Classification Results
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                DNA analysis and 3D model of the classified species.
              </p>

              {/* DNA Analysis Visualization */}
              <div className="mt-4 border border-slate-200 rounded-lg p-4 shadow">
                <h4 className="text-sm font-medium text-slate-900 mb-3">
                  DNA Analysis
                </h4>
                <img
                  src={`data:image/png;base64,${ednaResult.visualization}`}
                  alt="DNA Analysis Visualization"
                  className="w-full rounded-lg shadow"
                />
                <div className="mt-3 text-sm text-slate-600">
                  <span className="font-semibold">GC Content:</span>{" "}
                  {ednaResult.gcContent}% |
                  <span className="font-semibold"> DNA Length:</span>{" "}
                  {ednaResult.dnaLength} bp
                  {ednaResult.sequence && (
                    <div className="mt-2">
                      <span className="font-semibold">Sequence Sample: </span>
                      <span className="font-mono bg-slate-100 p-1 rounded text-xs">
                        {ednaResult.sequence.substring(0, 40)}
                        {ednaResult.sequence.length > 40 ? "..." : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3D DNA Model Carousel */}
              <div className="mt-4 border border-slate-200 rounded-lg p-4 shadow">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-slate-900">
                    DNA 3D Model
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const modal = document.createElement("div");
                        modal.className =
                          "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50";

                        // Create all the images for the carousel
                        const carouselImages = ednaResult.visualization3dViews
                          ? ednaResult.visualization3dViews
                              .map(
                                (img) =>
                                  `<img src="data:image/png;base64,${img}" class="max-w-full max-h-[85vh] object-contain hidden carousel-item"/>`
                              )
                              .join("")
                          : `<img src="data:image/png;base64,${ednaResult.visualization3d}" class="max-w-full max-h-[85vh] object-contain carousel-item"/>`;

                        modal.innerHTML = `
                          <div class="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg">
                            <button class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center z-20">×</button>
                            
                            <div class="carousel-container relative">
                              ${carouselImages}
                              
                              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
                              
                              <div class="absolute inset-x-0 top-1/2 flex justify-between items-center transform -translate-y-1/2 px-4 z-10">
                                <button class="rotate-left p-3 bg-white bg-opacity-75 rounded-full shadow hover:bg-blue-100 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                <button class="rotate-right p-3 bg-white bg-opacity-75 rounded-full shadow hover:bg-blue-100 transition-colors">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                              
                              <div class="absolute top-2 left-2 bg-white bg-opacity-75 px-3 py-1 rounded-full text-blue-800 font-mono text-sm flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span class="angle-indicator">0°</span>
                              </div>
                            </div>
                            
                            <div class="mt-4 flex justify-between items-center">
                              <div class="text-sm text-gray-600">
                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Drag horizontally</span> or 
                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded mx-2">use arrow keys</span> to rotate model
                              </div>
                              <a class="p-2 bg-green-500 text-white rounded" href="data:image/png;base64,${ednaResult.visualization3d}" download="dna_3d.png">Download</a>
                            </div>
                          </div>
                        `;

                        document.body.appendChild(modal);

                        // Set up carousel functionality
                        const items = modal.querySelectorAll(".carousel-item");
                        if (items.length > 0) {
                          items[0].classList.remove("hidden"); // Show first item

                          let currentIndex = 0;
                          let isDragging = false;
                          let startX = 0;

                          const showItem = (index) => {
                            // Handle wrapping around
                            if (index < 0) index = items.length - 1;
                            if (index >= items.length) index = 0;

                            // Hide all items
                            items.forEach((item) =>
                              item.classList.add("hidden")
                            );
                            // Show current item
                            items[index].classList.remove("hidden");
                            currentIndex = index;

                            // Update angle indicator
                            const angleIndicator =
                              modal.querySelector(".angle-indicator");
                            if (angleIndicator) {
                              // Convert index to degrees (assuming 8 views = 360 degrees)
                              const degrees = Math.floor(
                                index * (360 / items.length)
                              );
                              angleIndicator.textContent = `${degrees}°`;
                            }
                          };

                          // Set up rotation buttons
                          const rotateLeft =
                            modal.querySelector(".rotate-left");
                          const rotateRight =
                            modal.querySelector(".rotate-right");

                          rotateLeft.addEventListener("click", () => {
                            showItem(currentIndex - 1);
                          });

                          rotateRight.addEventListener("click", () => {
                            showItem(currentIndex + 1);
                          });

                          // Mouse/touch drag to rotate
                          const container = modal.querySelector(
                            ".carousel-container"
                          );

                          // Add grab cursor styles
                          container.style.cursor = "grab";

                          container.addEventListener("mousedown", (e) => {
                            isDragging = true;
                            startX = e.clientX;
                            container.style.cursor = "grabbing";
                          });

                          container.addEventListener("touchstart", (e) => {
                            isDragging = true;
                            startX = e.touches[0].clientX;
                            container.style.cursor = "grabbing";
                          });

                          container.addEventListener("mousemove", (e) => {
                            if (!isDragging) return;

                            const deltaX = e.clientX - startX;
                            if (Math.abs(deltaX) > 50) {
                              if (deltaX > 0) {
                                showItem(currentIndex - 1); // Right drag -> left rotation
                              } else {
                                showItem(currentIndex + 1); // Left drag -> right rotation
                              }
                              startX = e.clientX; // Reset start position for continuous dragging
                            }
                          });

                          container.addEventListener("touchmove", (e) => {
                            if (!isDragging) return;

                            const deltaX = e.touches[0].clientX - startX;
                            if (Math.abs(deltaX) > 50) {
                              if (deltaX > 0) {
                                showItem(currentIndex - 1); // Right drag -> left rotation
                              } else {
                                showItem(currentIndex + 1); // Left drag -> right rotation
                              }
                              startX = e.touches[0].clientX; // Reset start position for continuous dragging
                            }
                          });

                          container.addEventListener("mouseup", () => {
                            isDragging = false;
                            container.style.cursor = "grab";
                          });

                          container.addEventListener("touchend", () => {
                            isDragging = false;
                            container.style.cursor = "grab";
                          });

                          // Add auto-rotation feature with controls
                          let autoRotateInterval = null;
                          let isAutoRotating = false;

                          // Add auto-rotate button
                          const controlsDiv = modal.querySelector(".mt-4");
                          const autoRotateBtn =
                            document.createElement("button");
                          autoRotateBtn.className =
                            "p-2 bg-blue-500 text-white rounded mx-2";
                          autoRotateBtn.innerHTML = "Auto-Rotate";
                          autoRotateBtn.addEventListener("click", () => {
                            if (isAutoRotating) {
                              clearInterval(autoRotateInterval);
                              autoRotateBtn.innerHTML = "Auto-Rotate";
                              isAutoRotating = false;
                            } else {
                              autoRotateInterval = setInterval(() => {
                                showItem(currentIndex + 1);
                              }, 1000);
                              autoRotateBtn.innerHTML = "Stop Rotation";
                              isAutoRotating = true;
                            }
                          });

                          // Insert before the download button
                          controlsDiv.insertBefore(
                            autoRotateBtn,
                            controlsDiv.lastElementChild
                          );

                          // Keyboard arrow keys
                          window.addEventListener("keydown", function (e) {
                            if (e.key === "ArrowLeft") {
                              showItem(currentIndex - 1);
                            } else if (e.key === "ArrowRight") {
                              showItem(currentIndex + 1);
                            }
                          });
                        }

                        // Set up close button
                        const closeBtn = modal.querySelector("button");
                        closeBtn.addEventListener("click", () => {
                          document.body.removeChild(modal);
                        });
                      }}
                      className="p-1 bg-blue-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                      title="3D View"
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
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <a
                      href={`data:image/png;base64,${ednaResult.visualization3d}`}
                      download="dna_3d.png"
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
                  style={{ height: "300px" }}
                >
                  <img
                    src={`data:image/png;base64,${ednaResult.visualization3d}`}
                    alt="DNA 3D Model"
                    className="w-full h-full object-contain cursor-move"
                    title="Click to interact in 3D"
                    onClick={(e) => {
                      const button = e.target
                        .closest("div")
                        .previousSibling.querySelector("button");
                      button.click();
                    }}
                  />
                  <div className="absolute bottom-2 right-2 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                    Click for interactive 3D rotation
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 hover:opacity-0 transition-opacity duration-300">
                    <div className="bg-black bg-opacity-30 text-white px-4 py-2 rounded-full text-sm font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                      Interactive DNA Model
                    </div>
                  </div>
                </div>
              </div>

              {/* Probability Scores */}
              <div className="mt-4 border border-slate-200 rounded-lg p-4 shadow">
                <h4 className="text-sm font-medium text-slate-900 mb-3">
                  Species Probability Scores
                </h4>
                <div className="space-y-2">
                  {ednaResult.probabilities &&
                    Object.entries(ednaResult.probabilities)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([species, probability], index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className="w-1/3 text-sm font-medium truncate"
                            title={species}
                          >
                            {species}
                          </div>
                          <div className="w-2/3 flex items-center">
                            <div
                              className="h-4 rounded-full mr-2"
                              style={{
                                width: `${Math.max(probability * 100, 1)}%`,
                                backgroundColor:
                                  index === 0 ? "#4CAF50" : "#2196F3",
                                opacity: 1 - index * 0.15,
                              }}
                            ></div>
                            <span className="text-xs text-slate-600">
                              {(probability * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">
                      Species map points are displayed on the map
                    </p>
                    <p className="mt-1 text-xs">
                      The detected species has been highlighted on the map with
                      known habitat locations. You can return to the map view to
                      explore the regions where this species is commonly found.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info Section */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600">
              {selectedTab === "temperature" && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Sea Surface Temperature
                  </h4>
                  <p>
                    Temperature measurements show thermal conditions in ocean
                    waters. Higher temperatures can indicate climate patterns
                    and affect marine ecosystems.
                  </p>
                </div>
              )}
              {selectedTab === "salinity" && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Ocean Salinity Levels
                  </h4>
                  <p>
                    Salinity measures the concentration of dissolved salts in
                    seawater. It affects ocean circulation, marine life, and
                    water density patterns.
                  </p>
                </div>
              )}
              {selectedTab === "ph" && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Ocean pH Measurements
                  </h4>
                  <p>
                    pH levels indicate ocean acidity. Lower pH values suggest
                    increased acidity, which can impact coral reefs and marine
                    organisms.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
            {(activeTab === "search" || activeTab === null) && (
              <div className="text-sm text-slate-500">
                Click the tile above to toggle the {selectedTab} layer on the
                map
              </div>
            )}
            <div
              className={`flex space-x-3 ${
                activeTab === "search" || activeTab === null ? "" : "ml-auto"
              }`}
            >
              <button
                onClick={() => {
                  setActiveLayer("none");
                  onLayerChange("none");
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Clear Layers
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
