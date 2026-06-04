/**
 * Constants used across the application
 */

export const GIFT_PERSONALITIES = [
  "funny",
  "romantic",
  "practical",
  "adventurous",
  "artistic",
  "intellectual",
];

export const GIFT_OCCASIONS = [
  "birthday",
  "anniversary",
  "valentine",
  "festival",
  "casual",
  "wedding",
  "graduation",
  "christmas",
  "new year",
];

export const GIFT_RECIPIENTS = [
  "friend",
  "dad",
  "mom",
  "sibling",
  "colleague",
  "child",
  "partner",
  "wife",
  "husband",
  "family",
  "other",
];

export const AUTH_PROVIDERS = {
  PASSWORD: "password",
  GOOGLE: "google",
  PASSWORD_GOOGLE: "password+google",
};

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ERROR_MESSAGES = {
  INVALID_EMAIL: "Please enter a valid email address.",
  WEAK_PASSWORD: "Password must be at least 8 characters.",
  EMAIL_EXISTS: "An account with this email already exists.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  UNAUTHORIZED: "Unauthorized or expired token.",
  NOT_FOUND: "Resource not found.",
  BAD_REQUEST: "Invalid request.",
  SERVER_ERROR: "Internal server error.",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
};

export const API_LIMITS = {
  MAX_RECOMMENDATIONS: 50,
  DEFAULT_LIMIT: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 20,
};

export const PRICE_RANGES = {
  BUDGET: { min: 0, max: 500 },
  STANDARD: { min: 500, max: 2500 },
  PREMIUM: { min: 2500, max: 10000 },
  LUXURY: { min: 10000, max: Infinity },
};
