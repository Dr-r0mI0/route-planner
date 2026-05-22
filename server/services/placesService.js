/**
 * Places Service
 * Handles data operations for places
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, "../data/places.json");

export function readPlaces() {
  try {
    const data = readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function writePlaces(places) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(places, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing places:", error);
    return false;
  }
}

export function findPlaceById(id) {
  const places = readPlaces();
  return places.find((p) => p.id === id);
}

export function findPlaceByMapUrl(mapUrl) {
  const places = readPlaces();
  return places.find((p) => p.mapUrl === mapUrl);
}

export function createPlace(placeData) {
  const places = readPlaces();
  const newPlace = {
    id: Date.now().toString(),
    name: placeData.name || "Untitled Place",
    address: placeData.address || "",
    mapUrl: placeData.mapUrl || "",
    category: placeData.category || "general",
    contacts: placeData.contacts || [],
    lastVisit: placeData.lastVisit || null,
    createdBy: placeData.createdBy || null,
    createdAt: new Date().toISOString(),
  };

  places.push(newPlace);
  writePlaces(places);

  return newPlace;
}

export function updatePlace(id, updates) {
  const places = readPlaces();
  const index = places.findIndex((p) => p.id === id);

  if (index === -1) {
    return null;
  }

  const updatedPlace = {
    ...places[index],
    ...updates,
    id: places[index].id,
    createdAt: places[index].createdAt,
  };

  places[index] = updatedPlace;
  writePlaces(places);

  return updatedPlace;
}

export function deletePlace(id) {
  const places = readPlaces();
  const index = places.findIndex((p) => p.id === id);

  if (index === -1) {
    return false;
  }

  places.splice(index, 1);
  writePlaces(places);

  return true;
}

export function searchPlaces(query) {
  const places = readPlaces();
  const searchTerm = query.toLowerCase();

  return places.filter(
    (place) =>
      place.name.toLowerCase().includes(searchTerm) ||
      place.address.toLowerCase().includes(searchTerm) ||
      place.category.toLowerCase().includes(searchTerm)
  );
}

export function getPlacesByCategory(category) {
  const places = readPlaces();
  if (!category || category === "all") {
    return places;
  }
  return places.filter((p) => p.category === category);
}

export function bulkCreatePlaces(placesArray) {
  const places = readPlaces();
  const newPlaces = placesArray.map((placeData) => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: placeData.name || "Untitled Place",
    address: placeData.address || "",
    mapUrl: placeData.mapUrl || "",
    category: placeData.category || "general",
    contacts: placeData.contacts || [],
    lastVisit: placeData.lastVisit || null,
    createdBy: placeData.createdBy || null,
    createdAt: new Date().toISOString(),
  }));

  places.push(...newPlaces);
  writePlaces(places);

  return newPlaces;
}

export default {
  readPlaces,
  writePlaces,
  findPlaceById,
  findPlaceByMapUrl,
  createPlace,
  updatePlace,
  deletePlace,
  searchPlaces,
  getPlacesByCategory,
  bulkCreatePlaces,
};