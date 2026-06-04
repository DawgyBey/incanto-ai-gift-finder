import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import config from "./config.js";

import indexRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "../frontend");
const allowedOrigins = (config.clientOrigin || "*")
  .split(",")
  .map((origin) => origin.trim());

// Security
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "http://localhost:5000", "http://127.0.0.1:5000"],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
  })
);

// CORS
app.use(
  cors({
    origin(origin, callback) {
      const localDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "");
      const localFileOrigin = config.nodeEnv !== "production" && origin === "null";
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin) || localDevOrigin || localFileOrigin) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/v1", indexRouter);
app.use(express.static(frontendDir));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Incanto API is running",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(frontendDir, "index.html"));
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Server start
app.listen(config.port, () => {
  console.log(`Incanto API running on port ${config.port} (${config.nodeEnv})`);
});

export default app;
