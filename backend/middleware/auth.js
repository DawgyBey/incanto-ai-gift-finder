import crypto from "crypto";
import config from "../config.js";
import { createError } from "./errorHandler.js";

const TOKEN_SECRET = config.tokenSecret;

/**
 * Sign a JWT token for a user
 * @param {Object} user - User object
 * @returns {string} Signed JWT token
 */
export const signToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    exp: Date.now() + config.tokenTTL,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${signature}`;
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    if (!token || !token.includes(".")) return null;
    const [body, signature] = token.split(".");
    const expected = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(body)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (_err) {
    return null;
  }
};

/**
 * Hash a password using PBKDF2
 * @param {string} password - Password to hash
 * @param {string} salt - Optional salt (random if not provided)
 * @returns {string} Hashed password in format "salt:hash"
 */
export const hashPassword = (
  password,
  salt = crypto.randomBytes(16).toString("hex")
) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 120000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
};

/**
 * Verify a password against a saved hash
 * @param {string} password - Password to verify
 * @param {string} savedHash - Saved hash from database
 * @returns {boolean} True if password matches
 */
export const passwordsMatch = (password, savedHash) => {
  const [salt] = savedHash.split(":");
  return hashPassword(password, salt) === savedHash;
};

/**
 * Decode a Google credential token
 * @param {string} credential - Google credential token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export const decodeGoogleCredential = (credential) => {
  const parts = String(credential || "").split(".");
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch (_err) {
    return null;
  }
};

/**
 * Middleware to require authentication
 * Extracts and verifies the Authorization Bearer token
 * Attaches user to req.user if valid
 */
export const requireAuth = (users) => {
  return (req, _res, next) => {
    const rawHeader = req.get("Authorization") || "";
    const token = rawHeader.startsWith("Bearer ") ? rawHeader.slice(7) : null;
    const payload = verifyToken(token);

    if (!payload) return next(createError("Unauthorized or expired token.", 401));

    const user = users.find((item) => item.id === payload.sub);
    if (!user) return next(createError("User not found.", 401));

    req.user = user;
    next();
  };
};

/**
 * Middleware for optional authentication
 * Extracts token if present but doesn't require it
 */
export const optionalAuth = (users) => {
  return (req, _res, next) => {
    const rawHeader = req.get("Authorization") || "";
    const token = rawHeader.startsWith("Bearer ") ? rawHeader.slice(7) : null;
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        const user = users.find((item) => item.id === payload.sub);
        if (user) {
          req.user = user;
        }
      }
    }
    next();
  };
};

/**
 * Issue an authentication response with token and user data
 * @param {Object} res - Express response object
 * @param {Object} user - User object
 * @param {number} status - HTTP status code (default 200)
 */
export const issueAuthResponse = (res, user, status = 200) => {
  const token = signToken(user);
  res.status(status).json({
    success: true,
    data: {
      token,
      tokenType: "Bearer",
      expiresIn: config.tokenTTL / 1000,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        verified: user.verified,
        provider: user.provider,
        personalInfo: user.personalInfo || {},
        preferences: user.preferences || {},
        recentlyViewed: user.recentlyViewed || [],
        cart: user.cart || [],
      },
    },
  });
};
