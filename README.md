# 🌊 SIH-OCEAN Frontend

Interactive marine species classification and visualization platform built with React, Vite, and Tailwind CSS.

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js&logoColor=white)

## 🎯 Project Overview

SIH-OCEAN is a comprehensive marine species classification platform that enables identification of fish species through multiple methods: image analysis, otolith (ear bone) analysis, and eDNA sequencing. This frontend application provides an intuitive interface for species identification, visualization, and analysis of oceanographic data.

## ✨ Features

- 🗺️ **Interactive Map Interface**

  - OpenStreetMap base layer
  - Five key coastal regions coverage:
    - West Bengal (Bay of Bengal)
    - Goa (Arabian Sea)
    - Mumbai/Maharashtra (Arabian Sea)
    - Andaman & Nicobar Islands (Andaman Sea)
    - Lakshadweep Islands (Laccadive Sea)
  - Real-time region zooming
  - Responsive design for all devices

- 🔍 **Species Search**

  - Fast scientific name search with autocomplete
  - Color-coded species markers
  - Interactive popups with location details
  - Visual species legend

- 📊 **Data Visualization**
  - Mock sightings data structure
  - Precise geographical coordinates
  - Region-wise species distribution
  - Clean, minimalist UI

## 🛠️ Tech Stack

- **Framework:** React + Vite
- **Map Library:** React Leaflet
- **UI Components:** Headless UI
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Development:** ESLint + PostCSS

## ▶️ Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/SamudraNet/FrontEnd.git
   cd SamudraNet
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## 🎨 Design Choices

- **Light Theme**: Optimized for government marine data visualization
- **Mobile-First**: Fully responsive layout
- **Minimal UI**: Focus on data and map interaction
- **Modular Components**: Easy to extend and maintain
- **Mock Data Structure**: Ready for backend integration
