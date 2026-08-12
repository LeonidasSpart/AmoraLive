import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

const PORT = Number(process.env.PORT) || 8080;

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "AMORA Live API",
    status: "online",
    version: "1.0.0"
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "amora-live-backend",
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (_req, res) => {
  res.json({
    message: "Welcome to the AMORA Live API"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AMORA Live API running on port ${PORT}`);
});
