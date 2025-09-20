import React, { useState } from "react";
import "./ApiDocs.css";

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState("image");

  // Define API endpoints documentation
  const apiDocs = {
    image: {
      title: "Image Classification API",
      description: "API for image-based marine species identification",
      endpoints: [
        {
          method: "POST",
          path: "/classify/predict",
          description: "Upload an image for species identification",
          requestType: "multipart/form-data",
          requestParams: [
            {
              name: "image",
              type: "File",
              required: true,
              description: "Image file to classify",
            },
          ],
          responses: [
            {
              code: 200,
              description: "Success",
              schema: {
                species: "String - Identified species name",
                confidence: "Float - Confidence score (0-1)",
                top5: "Array - Top 5 species predictions with confidence scores",
                speciesId: "String - Species ID for frontend reference",
                visualization: "String - Base64 encoded image visualization",
                pca: "Object - PCA visualization coordinates",
                tsne: "Object - t-SNE visualization coordinates",
                mapPoints:
                  "Array - Geographic coordinates where species is found",
              },
            },
            { code: 400, description: "Validation Error" },
            { code: 500, description: "Internal Server Error" },
          ],
        },
      ],
    },
    otolith: {
      title: "Otolith Classification API",
      description: "API for fish otolith-based species identification",
      endpoints: [
        {
          method: "POST",
          path: "/otolith/predict",
          description: "Upload an otolith image for species identification",
          requestType: "multipart/form-data",
          requestParams: [
            {
              name: "image",
              type: "File",
              required: true,
              description: "Otolith image file to classify",
            },
          ],
          responses: [
            {
              code: 200,
              description: "Success",
              schema: {
                species: "String - Identified species name",
                speciesId: "String - Species ID for frontend reference",
                confidence: "Float - Confidence score (0-1)",
                visualization2d: "String - Base64 encoded 2D visualization",
                visualization3d:
                  "String - Base64 encoded 3D visualization (main view)",
                visualization3dViews:
                  "Array - Base64 encoded 3D visualizations (all rotation views)",
                confidenceViz:
                  "String - Base64 encoded confidence visualization",
                mapPoints:
                  "Array - Geographic coordinates where species is found",
              },
            },
            { code: 400, description: "Validation Error" },
            { code: 500, description: "Internal Server Error" },
          ],
        },
      ],
    },
    edna: {
      title: "eDNA Classification API",
      description: "API for environmental DNA-based species identification",
      endpoints: [
        {
          method: "POST",
          path: "/edna/predict",
          description: "Submit eDNA data for species identification",
          requestType: "application/json",
          requestBody: {
            gcContent: "Float - GC content percentage (0-100)",
            dnaLength: "Float - DNA length in base pairs",
            sequence: "String (optional) - DNA sequence (ATGC)",
          },
          responses: [
            {
              code: 200,
              description: "Success",
              schema: {
                species: "String - Identified species name",
                confidence: "Float - Confidence score (0-1)",
                topPredictions:
                  "Array - Top species predictions with probability scores",
                dnaAnalysisViz:
                  "String - Base64 encoded DNA analysis visualization",
                similarityViz:
                  "String - Base64 encoded similarity visualization",
                dna3dData:
                  "Object - 3D DNA visualization data for frontend renderer",
                inputData: "Object - Input data summary",
                modelInfo: "Object - Model information",
              },
            },
            { code: 400, description: "Validation Error" },
            { code: 500, description: "Internal Server Error" },
          ],
        },
      ],
    },
    species: {
      title: "Species Data API",
      description:
        "API for retrieving oceanographic data for identified species",
      endpoints: [
        {
          method: "GET",
          path: "/species/{species}/temperature",
          description: "Get temperature data for a species",
          pathParams: [
            {
              name: "species",
              type: "String",
              description: "Species ID (e.g., setipinna_tenuifilis)",
            },
          ],
          responses: [
            {
              code: 200,
              description: "Success",
              schema: {
                message: "String - Species data message",
              },
            },
            { code: 404, description: "Species Not Found" },
          ],
        },
        {
          method: "GET",
          path: "/species/{species}/ph",
          description: "Get pH data for a species",
          pathParams: [
            {
              name: "species",
              type: "String",
              description: "Species ID (e.g., setipinna_tenuifilis)",
            },
          ],
          responses: [
            {
              code: 200,
              description: "Success",
              schema: {
                message: "String - Species data message",
              },
            },
            { code: 404, description: "Species Not Found" },
          ],
        },
        {
          method: "GET",
          path: "/species/{species}/salinity",
          description: "Get salinity data for a species",
          pathParams: [
            {
              name: "species",
              type: "String",
              description: "Species ID (e.g., setipinna_tenuifilis)",
            },
          ],
          responses: [
            {
              code: 200,
              description: "Success",
              schema: {
                message: "String - Species data message",
              },
            },
            { code: 404, description: "Species Not Found" },
          ],
        },
      ],
    },
  };

  const renderSchema = (schema) => {
    return (
      <div className="border border-gray-200 rounded p-3 mt-2 bg-white text-sm font-mono shadow-sm">
        {"{"}
        <div className="pl-4">
          {Object.entries(schema).map(([key, value]) => (
            <div key={key} className="mb-1">
              <span className="text-blue-600">{key}</span>:{" "}
              <span className="text-gray-700">{value}</span>
            </div>
          ))}
        </div>
        {"}"}
      </div>
    );
  };

  const renderEndpoint = (endpoint) => {
    return (
      <div
        key={endpoint.path}
        className="border border-gray-200 rounded mb-6 overflow-hidden shadow-sm bg-white"
      >
        <div className="flex items-center p-3 bg-gray-50 border-b">
          <span
            className={`px-2 py-1 rounded text-white mr-3 font-medium text-sm ${
              endpoint.method === "GET" ? "bg-green-500" : "bg-blue-500"
            }`}
          >
            {endpoint.method}
          </span>
          <span className="font-mono text-gray-800">{endpoint.path}</span>
        </div>

        <div className="p-4">
          <p className="text-gray-700 mb-4">{endpoint.description}</p>{" "}
          {(endpoint.pathParams || []).length > 0 && (
            <>
              <h4 className="font-semibold text-gray-800 mt-3 mb-2">
                Path Parameters
              </h4>
              <ul className="list-disc pl-5 mb-4">
                {endpoint.pathParams.map((param) => (
                  <li key={param.name} className="mb-1">
                    <code className="bg-gray-100 px-1 font-mono">
                      {param.name}
                    </code>
                    <span className="text-gray-700">
                      {" "}
                      ({param.type}) - {param.description}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {(endpoint.requestParams || []).length > 0 && (
            <>
              <h4 className="font-semibold text-gray-800 mt-3 mb-2">
                Request Parameters
              </h4>
              <div className="mb-2">
                Content-Type:{" "}
                <code className="bg-gray-100 px-1 font-mono">
                  {endpoint.requestType}
                </code>
              </div>
              <ul className="list-disc pl-5 mb-4">
                {endpoint.requestParams.map((param) => (
                  <li key={param.name} className="mb-1">
                    <code className="bg-gray-100 px-1 font-mono">
                      {param.name}
                    </code>
                    <span className="text-gray-700"> ({param.type})</span>
                    {param.required && (
                      <span className="text-red-600"> *required</span>
                    )}
                    <span className="text-gray-700">
                      {" "}
                      - {param.description}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {endpoint.requestBody && (
            <>
              <h4 className="font-semibold text-gray-800 mt-3 mb-2">
                Request Body
              </h4>
              <div className="mb-2">
                Content-Type:{" "}
                <code className="bg-gray-100 px-1 font-mono">
                  {endpoint.requestType}
                </code>
              </div>
              {renderSchema(endpoint.requestBody)}
            </>
          )}
          <h4 className="font-semibold text-gray-800 mt-4 mb-2">Responses</h4>
          {endpoint.responses.map((response) => (
            <div key={response.code} className="mb-4">
              <div
                className={`inline-block px-2 py-1 rounded ${
                  response.code >= 200 && response.code < 300
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                } mb-2`}
              >
                {response.code} - {response.description}
              </div>
              {response.schema && renderSchema(response.schema)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl api-docs bg-white shadow-sm rounded-lg">
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold mb-0 text-gray-800">
          SamudraNet API Documentation
        </h1>
      </div>
      <p className="mb-6 text-gray-700">
        API documentation for the SamudraNet marine species identification and
        oceanographic data platform
      </p>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {Object.keys(apiDocs).map((key) => (
          <button
            key={key}
            className={`py-2 px-4 font-medium ${
              activeSection === key
                ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
            onClick={() => setActiveSection(key)}
          >
            {apiDocs[key].title}
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {apiDocs[activeSection].title}
        </h2>
        <p className="mb-6 text-gray-700">
          {apiDocs[activeSection].description}
        </p>

        {apiDocs[activeSection].endpoints.map((endpoint) =>
          renderEndpoint(endpoint)
        )}
      </div>

      <div className="mt-12 pt-4 border-t border-gray-200 text-gray-600 text-sm">
        <p>
          Base URL:{" "}
          <code className="bg-gray-50 px-2 py-1 rounded font-mono border border-gray-200">
            http://localhost:5173
          </code>
        </p>
        <p className="mt-1">All responses are returned in JSON format</p>
      </div>
    </div>
  );
}
