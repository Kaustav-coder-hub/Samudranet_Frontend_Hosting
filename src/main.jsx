import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import ApiDocs from "./pages/ApiDocs";
import "./assets/dnaViewerHelper.js";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/api/docs" element={<ApiDocs />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
