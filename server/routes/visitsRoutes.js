/**
 * Visits Routes
 * API endpoints for visit scheduling
 */

import { Router } from "express";
import {
  getAllVisits,
  getVisitById,
  createVisitHandler,
  updateVisitHandler,
  deleteVisitHandler,
  completeVisitHandler,
  skipVisitHandler,
  getUpcomingHandler,
  getHistoryHandler,
} from "../controllers/visitsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/visits - Get all visits (with optional filters)
router.get("/", getAllVisits);

// GET /api/visits/upcoming - Get upcoming visits
router.get("/upcoming", getUpcomingHandler);

// GET /api/visits/:id - Get single visit
router.get("/:id", getVisitById);

// GET /api/visits/history/:placeId - Get visit history for a place
router.get("/history/:placeId", getHistoryHandler);

// POST /api/visits - Create new visit (protected)
router.post("/", authMiddleware, createVisitHandler);

// POST /api/visits/:id/complete - Mark visit as completed (protected)
router.post("/:id/complete", authMiddleware, completeVisitHandler);

// POST /api/visits/:id/skip - Mark visit as skipped (protected)
router.post("/:id/skip", authMiddleware, skipVisitHandler);

// PUT /api/visits/:id - Update visit (protected)
router.put("/:id", authMiddleware, updateVisitHandler);

// DELETE /api/visits/:id - Delete visit (protected)
router.delete("/:id", authMiddleware, deleteVisitHandler);

export default router;