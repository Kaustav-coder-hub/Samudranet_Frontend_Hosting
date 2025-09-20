/**
 * API utilities for SamudraNet
 * This file provides functions to interact with the backend API endpoints
 */

// Base URL for API calls
const API_BASE_URL = "http://localhost:5000";

/**
 * Image Classification API
 * Upload an image for species identification
 * @param {File} imageFile - The image file to classify
 * @returns {Promise<Object>} Classification results
 */
export const classifyImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(`${API_BASE_URL}/classify/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Image classification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error classifying image:", error);
    throw error;
  }
};

/**
 * Otolith Classification API
 * Upload an otolith image for species identification
 * @param {File} imageFile - The otolith image file to classify
 * @returns {Promise<Object>} Classification results
 */
export const classifyOtolith = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(`${API_BASE_URL}/otolith/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Otolith classification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error classifying otolith:", error);
    throw error;
  }
};

/**
 * eDNA Classification API
 * Submit eDNA data for species identification
 * @param {Object} ednaData - The eDNA data
 * @param {number} ednaData.gcContent - GC content percentage (0-100)
 * @param {number} ednaData.dnaLength - DNA length in base pairs
 * @param {string} [ednaData.sequence] - Optional DNA sequence (ATGC)
 * @returns {Promise<Object>} Classification results
 */
export const classifyEDNA = async (ednaData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/edna/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ednaData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "eDNA classification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error classifying eDNA:", error);
    throw error;
  }
};

/**
 * Get species temperature data
 * @param {string} speciesId - Species ID
 * @returns {Promise<Object>} Temperature data
 */
export const getSpeciesTemperature = async (speciesId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/species/${speciesId}/temperature`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch temperature data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching temperature data:", error);
    throw error;
  }
};

/**
 * Get species pH data
 * @param {string} speciesId - Species ID
 * @returns {Promise<Object>} pH data
 */
export const getSpeciesPH = async (speciesId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/species/${speciesId}/ph`);

    if (!response.ok) {
      throw new Error("Failed to fetch pH data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pH data:", error);
    throw error;
  }
};

/**
 * Get species salinity data
 * @param {string} speciesId - Species ID
 * @returns {Promise<Object>} Salinity data
 */
export const getSpeciesSalinity = async (speciesId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/species/${speciesId}/salinity`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch salinity data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching salinity data:", error);
    throw error;
  }
};
