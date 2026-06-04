import { Router } from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createError } from "../middleware/errorHandler.js";

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const giftsPath = join(__dirname, "../data/gifts.json");

/**
 * Cache for gifts data
 */
let giftsCache = null;

/**
 * Load and cache gifts data
 */
const loadGifts = () => {
  if (!giftsCache) {
    try {
      const raw = readFileSync(giftsPath, "utf-8");
      const data = JSON.parse(raw);
      const giftList = Array.isArray(data)
        ? data
        : data.nepal_gift_database || data.gifts || [];
      giftsCache = giftList;
    } catch (err) {
      console.error("Error loading gifts data:", err);
      giftsCache = [];
    }
  }
  return giftsCache;
};

/**
 * GET /api/v1/data/gifts
 * Fetch all gifts with optional filtering
 */
router.get("/gifts", (req, res, next) => {
  try {
    const { category, occasion, recipient, maxPrice, limit = 20, offset = 0 } = req.query;
    const gifts = loadGifts();

    let filtered = [...gifts];

    // Apply filters
    const normalizeText = (value) => String(value || "").toLowerCase().trim();
    const normalizeGiftRecipients = (gift) =>
      Array.isArray(gift.Recipient)
        ? gift.Recipient.map((r) => String(r || "").toLowerCase().trim())
        : String(gift.Recipient || "")
            .split(/[,;&]/)
            .map((r) => String(r || "").toLowerCase().trim())
            .filter(Boolean);

    if (category) {
      const normalizedCategory = normalizeText(category);
      filtered = filtered.filter(
        (gift) => normalizeText(gift.Category || gift.category) === normalizedCategory
      );
    }

    if (occasion) {
      const normalizedOccasion = normalizeText(occasion);
      filtered = filtered.filter(
        (gift) => normalizeText(gift.Occasion || gift.occasion) === normalizedOccasion
      );
    }

    if (recipient) {
      const normalizedRecipient = normalizeText(recipient);
      filtered = filtered.filter((gift) =>
        normalizeGiftRecipients(gift).some((r) => r === normalizedRecipient)
      );
    }

    if (maxPrice) {
      const price = parseFloat(maxPrice);
      if (!isNaN(price)) {
        filtered = filtered.filter((gift) => {
          const giftPrice = Number(gift["Price (NPR)"] ?? gift.price ?? 0);
          return giftPrice <= price;
        });
      }
    }

    // Pagination
    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);
    const total = filtered.length;
    const results = filtered.slice(parsedOffset, parsedOffset + parsedLimit);

    res.json({
      success: true,
      message: "Gifts retrieved successfully",
      data: {
        total,
        limit: parsedLimit,
        offset: parsedOffset,
        results,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/data/gifts/:id
 * Fetch a single gift by ID
 */
router.get("/gifts/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    const gifts = loadGifts();
    const gift = gifts.find((g) => String(g.id) === id);

    if (!gift) {
      return next(createError(`Gift with ID "${id}" not found.`, 404));
    }

    res.json({
      success: true,
      message: "Gift retrieved successfully",
      data: gift,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/data/categories
 * Fetch all available categories
 */
router.get("/categories", (req, res, next) => {
  try {
    const gifts = loadGifts();
    const categories = [
      ...new Set(
        gifts
          .map((gift) => String(gift.Category || gift.category || "").trim())
          .filter(Boolean)
      ),
    ];

    res.json({
      success: true,
      message: "Categories retrieved successfully",
      data: {
        total: categories.length,
        categories: categories.sort(),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/data/occasions
 * Fetch all available occasions
 */
router.get("/occasions", (req, res, next) => {
  try {
    const gifts = loadGifts();
    const occasions = [
      ...new Set(
        gifts
          .map((gift) => String(gift.Occasion || gift.occasion || "").trim())
          .filter(Boolean)
      ),
    ];

    res.json({
      success: true,
      message: "Occasions retrieved successfully",
      data: {
        total: occasions.length,
        occasions: occasions.sort(),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/data/recipients
 * Fetch all available recipients
 */
router.get("/recipients", (req, res, next) => {
  try {
    const gifts = loadGifts();
    const recipientsSet = new Set();

    gifts.forEach((gift) => {
      const recipients = Array.isArray(gift.Recipient)
        ? gift.Recipient
        : String(gift.Recipient || "")
            .split(/[,;&]/)
            .map((r) => r.trim());
      recipients.forEach((r) => {
        if (r) recipientsSet.add(r.toLowerCase());
      });
    });

    const recipients = Array.from(recipientsSet).sort();

    res.json({
      success: true,
      message: "Recipients retrieved successfully",
      data: {
        total: recipients.length,
        recipients,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/data/stats
 * Fetch statistics about the gift database
 */
router.get("/stats", (req, res, next) => {
  try {
    const gifts = loadGifts();
    const prices = gifts
      .map((g) => Number(g["Price (NPR)"] ?? g.price ?? 0))
      .filter((p) => p > 0);

    const stats = {
      totalGifts: gifts.length,
      priceStats: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        average: prices.reduce((a, b) => a + b, 0) / prices.length,
        median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
      },
      categories: new Set(
        gifts.map((g) => String(g.Category || g.category || "").trim())
      ).size,
      occasions: new Set(
        gifts.map((g) => String(g.Occasion || g.occasion || "").trim())
      ).size,
    };

    res.json({
      success: true,
      message: "Statistics retrieved successfully",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Data endpoint info
 * GET /api/v1/data
 */
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Data API is running",
    endpoints: {
      gifts: "GET /api/v1/data/gifts - Fetch all gifts with filtering",
      giftById: "GET /api/v1/data/gifts/:id - Fetch single gift",
      categories: "GET /api/v1/data/categories - Fetch all categories",
      occasions: "GET /api/v1/data/occasions - Fetch all occasions",
      recipients: "GET /api/v1/data/recipients - Fetch all recipients",
      stats: "GET /api/v1/data/stats - Fetch database statistics",
    },
  });
});

export default router;
