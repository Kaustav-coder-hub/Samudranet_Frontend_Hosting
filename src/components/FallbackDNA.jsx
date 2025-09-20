import React from "react";
const FallbackDNA = ({ message }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200 p-4 rounded-lg">
      <div className="mb-4 text-red-600 font-semibold">
        {message || "3D viewer couldn't be loaded"}
      </div>

      <div className="w-full max-w-md h-64 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 400 200"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="backbone1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0055aa" />
                <stop offset="100%" stopColor="#0066cc" />
              </linearGradient>
              <linearGradient id="backbone2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00aa55" />
                <stop offset="100%" stopColor="#00cc66" />
              </linearGradient>
            </defs>
            <path
              d="M50,100 C70,70 90,70 110,100 C130,130 150,130 170,100 C190,70 210,70 230,100 C250,130 270,130 290,100 C310,70 330,70 350,100"
              fill="none"
              stroke="url(#backbone1)"
              strokeWidth="5"
            />
            <path
              d="M50,100 C70,130 90,130 110,100 C130,70 150,70 170,100 C190,130 210,130 230,100 C250,70 270,70 290,100 C310,130 330,130 350,100"
              fill="none"
              stroke="url(#backbone2)"
              strokeWidth="5"
            />
            <line
              x1="70"
              y1="70"
              x2="70"
              y2="130"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx="70" cy="70" r="10" fill="#ff3333" />
            <circle cx="70" cy="130" r="10" fill="#3333ff" />
            <text
              x="70"
              y="74"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              A
            </text>
            <text
              x="70"
              y="134"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              T
            </text>

            <line
              x1="110"
              y1="100"
              x2="110"
              y2="100"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx="110" cy="100" r="10" fill="#ffcc00" />
            <circle
              cx="110"
              cy="100"
              r="10"
              fill="#33cc33"
              transform="translate(0, -30)"
            />
            <text
              x="110"
              y="104"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              G
            </text>
            <text
              x="110"
              y="74"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              C
            </text>

            <line
              x1="150"
              y1="70"
              x2="150"
              y2="130"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx="150" cy="70" r="10" fill="#ff3333" />
            <circle cx="150" cy="130" r="10" fill="#3333ff" />
            <text
              x="150"
              y="74"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              A
            </text>
            <text
              x="150"
              y="134"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              T
            </text>

            <line
              x1="190"
              y1="70"
              x2="190"
              y2="130"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx="190" cy="70" r="10" fill="#3333ff" />
            <circle cx="190" cy="130" r="10" fill="#ff3333" />
            <text
              x="190"
              y="74"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              T
            </text>
            <text
              x="190"
              y="134"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              A
            </text>

            <line
              x1="230"
              y1="100"
              x2="230"
              y2="100"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx="230" cy="100" r="10" fill="#ffcc00" />
            <circle
              cx="230"
              cy="100"
              r="10"
              fill="#33cc33"
              transform="translate(0, -30)"
            />
            <text
              x="230"
              y="104"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              G
            </text>
            <text
              x="230"
              y="74"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              C
            </text>

            <line
              x1="270"
              y1="70"
              x2="270"
              y2="130"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx="270" cy="70" r="10" fill="#33cc33" />
            <circle cx="270" cy="130" r="10" fill="#ffcc00" />
            <text
              x="270"
              y="74"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              C
            </text>
            <text
              x="270"
              y="134"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              G
            </text>

            <line
              x1="310"
              y1="70"
              x2="310"
              y2="130"
              stroke="#ffffff"
              strokeWidth="3"
            />
            <circle cx="310" cy="70" r="10" fill="#ff3333" />
            <circle cx="310" cy="130" r="10" fill="#3333ff" />
            <text
              x="310"
              y="74"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              A
            </text>
            <text
              x="310"
              y="134"
              fontSize="12"
              fill="white"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              T
            </text>
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Adenine (A)</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Thymine (T)</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span>Guanine (G)</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Cytosine (C)</span>
        </div>
      </div>
      <div className="text-sm text-center mt-4 text-gray-700">
        <p>eDNA Classification Model - Static View</p>
      </div>
    </div>
  );
};
export default FallbackDNA;
