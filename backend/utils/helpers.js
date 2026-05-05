/**
 * Utility functions used across the application
 */

/**
 * Format HTTP response
 * @param {boolean} success - Success flag
 * @param {string} message - Response message
 * @param {*} data - Response data
 * @returns {Object} Formatted response
 */
export const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    ...(data !== null && { data }),
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Valid email or not
 */
export const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with details
 */
export const validatePassword = (password) => {
  const result = {
    valid: true,
    errors: [],
  };

  if (password.length < 8) {
    result.valid = false;
    result.errors.push("Password must be at least 8 characters.");
  }

  if (!/[a-z]/.test(password)) {
    result.valid = false;
    result.errors.push("Password must contain lowercase letters.");
  }

  if (!/[A-Z]/.test(password)) {
    result.valid = false;
    result.errors.push("Password must contain uppercase letters.");
  }

  if (!/[0-9]/.test(password)) {
    result.valid = false;
    result.errors.push("Password must contain numbers.");
  }

  return result;
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input
    .trim()
    .replace(/[<>\"']/g, (char) => {
      const escapeMap = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      };
      return escapeMap[char] || char;
    });
};

/**
 * Normalize string input (trim and lowercase)
 * @param {string} input - Input to normalize
 * @returns {string} Normalized input
 */
export const normalizeInput = (input) => {
  return String(input || "").trim().toLowerCase();
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
export const paginate = (array, page = 1, limit = 10) => {
  const totalPages = Math.ceil(array.length / limit);
  const startIndex = Math.max(0, (page - 1) * limit);
  const items = array.slice(startIndex, startIndex + limit);

  return {
    items,
    page,
    limit,
    total: array.length,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} Merged object
 */
export const deepMerge = (target, source) => {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = deepMerge(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

/**
 * Check if value is an object
 * @param {*} item - Item to check
 * @returns {boolean} Is object or not
 */
export const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: NPR)
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = "NPR") => {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
};

/**
 * Format date to ISO string
 * @param {Date} date - Date object
 * @returns {string} ISO formatted date
 */
export const formatDate = (date = new Date()) => {
  return date.toISOString();
};

/**
 * Get age from birthdate
 * @param {Date} birthDate - Birth date
 * @returns {number} Age
 */
export const getAge = (birthDate) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
