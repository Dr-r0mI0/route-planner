/**
 * Visits Controller
 * Handles API requests for visit scheduling
 */

import {
  readVisits,
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
} from "../services/visitsService.js";

export async function getAllVisits(req, res) {
  try {
    const { date, userId, placeId, status } = req.query;
    let visits = readVisits();

    if (date) {
      visits = getVisitsByDate(date);
    } else if (userId) {
      visits = getVisitsByUser(userId);
    } else if (placeId) {
      visits = getVisitsByPlace(placeId);
    } else if (status) {
      visits = getVisitsByStatus(status);
    }

    res.json({
      visits,
      count: visits.length,
    });
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to fetch visits",
    });
  }
}

export async function getVisitById(req, res) {
  try {
    const { id } = req.params;
    const visit = readVisits().find((v) => v.id === id);

    if (!visit) {
      return res.status(404).json({
        error: "Not found",
        message: "Visit not found",
      });
    }

    res.json({ visit });
  } catch (error) {
    console.error("Error fetching visit:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to fetch visit",
    });
  }
}

export async function createVisitHandler(req, res) {
  try {
    const { placeId, placeName, placeAddress, mapUrl, scheduledDate, scheduledTime, notes } = req.body;

    if (!placeName) {
      return res.status(400).json({
        error: "Validation error",
        message: "Place name is required",
      });
    }

    if (!scheduledDate) {
      return res.status(400).json({
        error: "Validation error",
        message: "Scheduled date is required",
      });
    }

    const newVisit = createVisit({
      placeId,
      placeName,
      placeAddress,
      mapUrl,
      userId: req.user?.userId || null,
      scheduledDate,
      scheduledTime: scheduledTime || "09:00",
      notes,
    });

    res.status(201).json({
      message: "Visit scheduled successfully",
      visit: newVisit,
    });
  } catch (error) {
    console.error("Error creating visit:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to create visit",
    });
  }
}

export async function updateVisitHandler(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.createdAt;

    const updatedVisit = updateVisit(id, updates);

    if (!updatedVisit) {
      return res.status(404).json({
        error: "Not found",
        message: "Visit not found",
      });
    }

    res.json({
      message: "Visit updated successfully",
      visit: updatedVisit,
    });
  } catch (error) {
    console.error("Error updating visit:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to update visit",
    });
  }
}

export async function deleteVisitHandler(req, res) {
  try {
    const { id } = req.params;
    const success = deleteVisit(id);

    if (!success) {
      return res.status(404).json({
        error: "Not found",
        message: "Visit not found",
      });
    }

    res.json({
      message: "Visit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting visit:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to delete visit",
    });
  }
}

export async function completeVisitHandler(req, res) {
  try {
    const { id } = req.params;

    const completedVisit = completeVisit(id);

    if (!completedVisit) {
      return res.status(404).json({
        error: "Not found",
        message: "Visit not found",
      });
    }

    res.json({
      message: "Visit marked as completed",
      visit: completedVisit,
    });
  } catch (error) {
    console.error("Error completing visit:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to complete visit",
    });
  }
}

export async function skipVisitHandler(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const skippedVisit = skipVisit(id, reason);

    if (!skippedVisit) {
      return res.status(404).json({
        error: "Not found",
        message: "Visit not found",
      });
    }

    res.json({
      message: "Visit marked as skipped",
      visit: skippedVisit,
    });
  } catch (error) {
    console.error("Error skipping visit:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to skip visit",
    });
  }
}

export async function getUpcomingHandler(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const visits = getUpcomingVisits(limit);

    res.json({
      visits,
      count: visits.length,
    });
  } catch (error) {
    console.error("Error fetching upcoming visits:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to fetch upcoming visits",
    });
  }
}

export async function getHistoryHandler(req, res) {
  try {
    const { placeId } = req.params;
    const visits = getVisitHistory(placeId);

    res.json({
      visits,
      count: visits.length,
    });
  } catch (error) {
    console.error("Error fetching visit history:", error);
    res.status(500).json({
      error: "Server error",
      message: "Failed to fetch visit history",
    });
  }
}

export default {
  getAllVisits,
  getVisitById,
  createVisitHandler,
  updateVisitHandler,
  deleteVisitHandler,
  completeVisitHandler,
  skipVisitHandler,
  getUpcomingHandler,
  getHistoryHandler,
};