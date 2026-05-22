/**
 * Visits Service
 * Handles data operations for scheduled visits
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, "../data/visits.json");

export function readVisits() {
  try {
    const data = readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export function writeVisits(visits) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(visits, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing visits:", error);
    return false;
  }
}

export function findVisitById(id) {
  const visits = readVisits();
  return visits.find((v) => v.id === id);
}

export function createVisit(visitData) {
  const visits = readVisits();
  const newVisit = {
    id: Date.now().toString(),
    placeId: visitData.placeId || null,
    placeName: visitData.placeName || "Unknown Place",
    placeAddress: visitData.placeAddress || "",
    mapUrl: visitData.mapUrl || "",
    userId: visitData.userId || null,
    scheduledDate: visitData.scheduledDate || new Date().toISOString().split("T")[0],
    scheduledTime: visitData.scheduledTime || "09:00",
    status: visitData.status || "scheduled",
    notes: visitData.notes || "",
    completedAt: null,
    createdAt: new Date().toISOString(),
  };

  visits.push(newVisit);
  writeVisits(visits);

  return newVisit;
}

export function updateVisit(id, updates) {
  const visits = readVisits();
  const index = visits.findIndex((v) => v.id === id);

  if (index === -1) {
    return null;
  }

  const updatedVisit = {
    ...visits[index],
    ...updates,
    id: visits[index].id,
    createdAt: visits[index].createdAt,
  };

  visits[index] = updatedVisit;
  writeVisits(visits);

  return updatedVisit;
}

export function deleteVisit(id) {
  const visits = readVisits();
  const index = visits.findIndex((v) => v.id === id);

  if (index === -1) {
    return false;
  }

  visits.splice(index, 1);
  writeVisits(visits);

  return true;
}

export function getVisitsByDate(date) {
  const visits = readVisits();
  return visits.filter((v) => v.scheduledDate === date);
}

export function getVisitsByUser(userId) {
  const visits = readVisits();
  return visits.filter((v) => v.userId === userId);
}

export function getVisitsByPlace(placeId) {
  const visits = readVisits();
  return visits.filter((v) => v.placeId === placeId);
}

export function getVisitsByStatus(status) {
  const visits = readVisits();
  return visits.filter((v) => v.status === status);
}

export function completeVisit(id) {
  const visits = readVisits();
  const index = visits.findIndex((v) => v.id === id);

  if (index === -1) {
    return null;
  }

  visits[index] = {
    ...visits[index],
    status: "completed",
    completedAt: new Date().toISOString(),
  };

  writeVisits(visits);

  return visits[index];
}

export function skipVisit(id, reason) {
  const visits = readVisits();
  const index = visits.findIndex((v) => v.id === id);

  if (index === -1) {
    return null;
  }

  visits[index] = {
    ...visits[index],
    status: "skipped",
    notes: reason ? `${visits[index].notes}\nSkipped: ${reason}`.trim() : visits[index].notes,
  };

  writeVisits(visits);

  return visits[index];
}

export function getUpcomingVisits(limit = 10) {
  const visits = readVisits();
  const today = new Date().toISOString().split("T")[0];

  return visits
    .filter((v) => v.scheduledDate >= today && v.status === "scheduled")
    .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
    .slice(0, limit);
}

export function getVisitHistory(placeId) {
  const visits = readVisits();
  return visits
    .filter((v) => v.placeId === placeId && v.status === "completed")
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export default {
  readVisits,
  writeVisits,
  findVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  getVisitsByDate,
  getVisitsByUser,
  getVisitsByPlace,
  getVisitsByStatus,
  completeVisit,
  skipVisit,
  getUpcomingVisits,
  getVisitHistory,
};