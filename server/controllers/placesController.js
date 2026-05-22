/**
 * Places Controller
 * Handles API requests for places management
 */

import {
  readPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  searchPlaces,
  getPlacesByCategory,
  bulkCreatePlaces,
} from "../services/placesService.js";

export async function getAllPlaces(req, res) {
  try {
    const { category, search } = req.query;

    let places;

    if (search) {
      places = searchPlaces(search);
    } else if (category) {
      places = getPlacesByCategory(category);
    } else {
      places = readPlaces();
    }

    res.json({
      places,
      count: places.length,
    });
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to fetch places",
    });
  }
}

export async function getPlaceById(req, res) {
  try {
    const { id } = req.params;
    const places = readPlaces();
    const place = places.find((p) => p.id === id);

    if (!place) {
      return res.status(404).json({
        error: "Not found",
        message: "Place not found",
      });
    }

    res.json({ place });
  } catch (error) {
    console.error("Error fetching place:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to fetch place",
    });
  }
}

export async function createPlaceHandler(req, res) {
  try {
    const { name, address, mapUrl, category, contacts, lastVisit } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Validation error",
        message: "Name is required",
      });
    }

    const newPlace = createPlace({
      name,
      address,
      mapUrl,
      category,
      contacts,
      lastVisit,
      createdBy: req.user?.userId || null,
    });

    res.status(201).json({
      message: "Place created successfully",
      place: newPlace,
    });
  } catch (error) {
    console.error("Error creating place:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to create place",
    });
  }
}

export async function updatePlaceHandler(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.createdAt;

    const updatedPlace = updatePlace(id, updates);

    if (!updatedPlace) {
      return res.status(404).json({
        error: "Not found",
        message: "Place not found",
      });
    }

    res.json({
      message: "Place updated successfully",
      place: updatedPlace,
    });
  } catch (error) {
    console.error("Error updating place:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to update place",
    });
  }
}

export async function deletePlaceHandler(req, res) {
  try {
    const { id } = req.params;

    const success = deletePlace(id);

    if (!success) {
      return res.status(404).json({
        error: "Not found",
        message: "Place not found",
      });
    }

    res.json({
      message: "Place deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting place:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to delete place",
    });
  }
}

export async function importPlacesHandler(req, res) {
  try {
    const { places } = req.body;

    if (!Array.isArray(places) || places.length === 0) {
      return res.status(400).json({
        error: "Validation error",
        message: "Places array is required",
      });
    }

    const createdPlaces = bulkCreatePlaces(
      places.map((p) => ({
        ...p,
        createdBy: req.user?.userId || null,
      }))
    );

    res.status(201).json({
      message: `Successfully imported ${createdPlaces.length} places`,
      places: createdPlaces,
      count: createdPlaces.length,
    });
  } catch (error) {
    console.error("Error importing places:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to import places",
    });
  }
}

export default {
  getAllPlaces,
  getPlaceById,
  createPlaceHandler,
  updatePlaceHandler,
  deletePlaceHandler,
  importPlacesHandler,
};