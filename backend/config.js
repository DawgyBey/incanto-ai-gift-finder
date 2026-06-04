//backend-config.js

import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  isDevelopment: process.env.NODE_ENV !== "production",
  isProduction: process.env.NODE_ENV === "production",

  // Client
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",

  // Authentication
  tokenSecret: process.env.AUTH_TOKEN_SECRET || "incanto-dev-secret-change-me",
  tokenTTL: 1000 * 60 * 60 * 24 * 7, // 7 days in milliseconds

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

  // Database
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/incanto",

  // AI/API Keys
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY || "",
  apiKey: process.env.API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",

  // Email (Optional)
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    senderEmail: process.env.SENDER_EMAIL || "noreply@incanto.com",
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
};

export default config;