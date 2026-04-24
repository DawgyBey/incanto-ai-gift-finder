import { Router } from "express";
import { getRecommendations } from "../services/recommendationService.js";
import { createError } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/v1/gifts/recommendations
router.get("/recommendations", async (req, res, next) => {
  try {
    const { budget, recipient, interests, personality, occasion, limit = 10, page = 1 } = req.query;

    const resolvedBudget =
      budget !== undefined ? parseFloat(budget) : null;

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

    if (resolvedBudget !== null && (isNaN(resolvedBudget) || resolvedBudget < 0)) {
      return next(createError("Budget must be a non-negative number.", 400));
    }

    const parsedLimit = Math.min(parseInt(limit) || 10, 50);
    const parsedPage = Math.max(parseInt(page) || 1, 1);

    const recommendations = await getRecommendations(
      {
        budget: resolvedBudget,
        recipient: resolvedRecipient,
        interests: resolvedInterests,
        personality: resolvedPersonality,
        occasion: resolvedOccasion,
      },
      { limit: parsedLimit, page: parsedPage }
    );

    res.json({
      success: true,
      message: "Recommendations retrieved successfully.",
      data: {
        appliedFilters: {
          budget: resolvedBudget,
          recipient: resolvedRecipient,
          interests: resolvedInterests,
          personality: resolvedPersonality,
          occasion: resolvedOccasion,
        },
        ...recommendations,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
