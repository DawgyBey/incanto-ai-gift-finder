import { Router } from "express";
import { getRecommendations } from "../services/recommendationService.js";
import { createError } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/v1/gifts/recommendations
router.get("/recommendations", async (req, res, next) => {
  try {
    const {
      budget,
      minBudget,
      recipient,
      interests,
      personality,
      occasion,
      category,
      tags,
      availability,
      preferOnline,
      preferLocal,
      limit = 10,
      page = 1,
    } = req.query;

    const resolvedBudget =
      budget !== undefined ? parseFloat(budget) : null;
    const resolvedMinBudget =
      minBudget !== undefined ? parseFloat(minBudget) : null;

    const resolvedRecipient =
      recipient !== undefined ? recipient : null;

    const resolvedInterests =
      interests !== undefined
        ? String(interests)
            .split(",")
            .map((i) => i.trim().toLowerCase())
        : [];

    const resolvedPersonality =
      personality !== undefined ? personality : null;

    const resolvedOccasion =
      occasion !== undefined ? occasion : null;

    const resolvedTags =
      tags !== undefined
        ? String(tags)
            .split(",")
            .map((i) => i.trim().toLowerCase())
            .filter(Boolean)
        : [];

    if (resolvedBudget !== null && (isNaN(resolvedBudget) || resolvedBudget < 0)) {
      return next(createError("Budget must be a non-negative number.", 400));
    }
    if (resolvedMinBudget !== null && (isNaN(resolvedMinBudget) || resolvedMinBudget < 0)) {
      return next(createError("Minimum budget must be a non-negative number.", 400));
    }

    const parsedLimit = Math.min(parseInt(limit) || 10, 50);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    const recommendations = await getRecommendations(
      {
        budget: resolvedBudget,
        minBudget: resolvedMinBudget,
        recipient: resolvedRecipient,
        interests: resolvedInterests,
        personality: resolvedPersonality,
        occasion: resolvedOccasion,
        category: category || null,
        tags: resolvedTags,
        availability: availability || null,
        preferOnline: String(preferOnline || "").toLowerCase() === "true",
        preferLocal: String(preferLocal || "").toLowerCase() === "true",
      },
      { limit: parsedLimit, page: parsedPage }
    );

    const responseMessage =
      recommendations.total > 0
        ? 'Recommendations retrieved successfully.'
        : 'No gifts match your exact preferences and budget.';

    res.json({
      success: true,
      message: responseMessage,
      data: {
        appliedFilters: {
          budget: resolvedBudget,
          minBudget: resolvedMinBudget,
          recipient: resolvedRecipient,
          interests: resolvedInterests,
          personality: resolvedPersonality,
          occasion: resolvedOccasion,
          category: category || null,
          tags: resolvedTags,
          availability: availability || null,
        },
        ...recommendations,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
