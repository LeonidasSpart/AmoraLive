import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./prisma.js";

// Import all route modules
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import photoRoutes from "./routes/photos.js";
import preferenceRoutes from "./routes/preferences.js";
import likeRoutes from "./routes/likes.js";
import matchRoutes from "./routes/matches.js";
import messageRoutes from "./routes/messages.js";
import notificationRoutes from "./routes/notifications.js";
import blockRoutes from "./routes/blocks.js";
import reportRoutes from "./routes/reports.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import coinRoutes from "./routes/coins.js";
import giftRoutes from "./routes/gifts.js";
import liveRoutes from "./routes/live.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Global Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// Public Endpoints
app.get("/", (_req, res) => {
  res.json({ name: "AMORA Live API", status: "online", version: "1.0.0" });
});
app.get("/api", (_req, res) => {
  res.json({ message: "Welcome to the AMORA Live API" });
});
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", service: "amora-live-backend", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", service: "amora-live-backend", database: "disconnected" });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/photos", photoRoutes);
app.use("/api/preferences", preferenceRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/live", liveRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found", path: req.path });
});

// Global Error Handler
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled API error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AMORA Live API running on port ${PORT}`);
});
