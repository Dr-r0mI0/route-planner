/**
 * Places Routes
 * API endpoints for places management
 */

import { Router } from "express";
import {
  getAllPlaces,
  getPlaceById,
  createPlaceHandler,
  updatePlaceHandler,
  deletePlaceHandler,
  importPlacesHandler,
} from "../controllers/placesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// GET /api/places - Get all places (with optional filters)
router.get("/", getAllPlaces);

// GET /api/places/:id - Get single place
router.get("/:id", getPlaceById);

// POST /api/places - Create new place (protected)
router.post("/", authMiddleware, createPlaceHandler);

// POST /api/places/import - Bulk import places (protected)
router.post("/import", authMiddleware, importPlacesHandler);

// PUT /api/places/:id - Update place (protected)
router.put("/:id", authMiddleware, updatePlaceHandler);

// DELETE /api/places/:id - Delete place (protected)
router.delete("/:id", authMiddleware, deletePlaceHandler);

export default router;