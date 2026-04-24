import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import indexRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

// Health check
app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Incanto API is running" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Server start
app.listen(PORT, () => {
  console.log(`Incanto API running on port ${PORT}`);
});

export default app;