import 'dotenv/config';
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import urlRoutes from "./routes/urlRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import pipelineRoutes from "./routes/pipelineRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import placesRoutes from "./routes/placesRoutes.js";
import visitsRoutes from "./routes/visitsRoutes.js";
import communitiesRoutes from "./routes/communitiesRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api", urlRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api", pipelineRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/places", placesRoutes);
app.use("/api/visits", visitsRoutes);
app.use("/api/communities", communitiesRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static frontend files from dist directory
app.use(express.static(path.join(__dirname, "../dist")));

// SPA Fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Route Optimizer API server running on port ${PORT}`);
});