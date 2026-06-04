import { Router } from "express";
import config from "../config.js";
import { createError } from "../middleware/errorHandler.js";

const router = Router();
const GEMINI_MODEL = config.geminiModel;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_COOLDOWN_MS = 10 * 60 * 1000;
let geminiDisabledUntil = 0;
let lastGeminiNotice = "";

const isGeminiQuotaError = (err) =>
  err?.statusCode === 429 ||
  err?.statusCode === 403 ||
  /quota|billing|rate|limit|permission|forbidden/i.test(err?.message || "");

const getGeminiFallbackReason = (err) => {
  if (!config.geminiApiKey) return "Gemini API key is not configured";
  if (isGeminiQuotaError(err)) return "Gemini quota or billing is unavailable";
  if (err?.message) return "Gemini response was unavailable";
  return "Using local smart ranking";
};

const noteGeminiFallback = (reason) => {
  const now = Date.now();
  if (reason.includes("quota") || reason.includes("billing") || reason.includes("unavailable")) {
    geminiDisabledUntil = now + GEMINI_COOLDOWN_MS;
  }

  const notice = `Smart Choice using local ranking: ${reason}.`;
  if (notice !== lastGeminiNotice) {
    console.info(notice);
    lastGeminiNotice = notice;
  }
};

const cleanGift = (gift = {}) => ({
  id: gift.id,
  name: gift.name || gift.item_name || "Gift item",
  description: gift.description || "",
  price: gift.price || gift.price_npr || null,
  priceLabel: gift.priceLabel || "",
  category: gift.category || "",
  tags: Array.isArray(gift.tags) ? gift.tags.slice(0, 8) : [],
  recipients: Array.isArray(gift.recipients) ? gift.recipients.slice(0, 6) : gift.recipient || [],
  occasions: Array.isArray(gift.occasions) ? gift.occasions.slice(0, 6) : gift.occasion || [],
  reason: gift.reason || "",
});

const normalizeText = (value) => String(value || "").toLowerCase().trim();

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean);
  return String(value || "")
    .split(",")
    .map(normalizeText)
    .filter(Boolean);
};

const scoreLocalGift = (gift, preferences = {}) => {
  const selectedRecipient = normalizeText(preferences.recipient);
  const selectedOccasion = normalizeText(preferences.occasion);
  const selectedInterests = normalizeList(preferences.interests);
  const selectedPersonality = normalizeText(preferences.personality);
  const minBudget = Number(preferences.minBudget) || 0;
  const maxBudget = Number(preferences.budget) || Number.MAX_SAFE_INTEGER;
  const price = Number(gift.price) || 0;
  const giftTags = normalizeList(gift.tags);
  const giftRecipients = normalizeList(gift.recipients);
  const giftOccasions = normalizeList(gift.occasions);
  const giftCategory = normalizeText(gift.category);
  const giftText = normalizeText(`${gift.name} ${gift.description} ${gift.reason}`);
  const reasons = [];
  let score = 0;

  if (selectedRecipient && giftRecipients.includes(selectedRecipient)) {
    score += 35;
    reasons.push(`fits ${selectedRecipient}`);
  } else if (selectedRecipient && giftText.includes(selectedRecipient)) {
    score += 12;
  }

  if (selectedOccasion && giftOccasions.includes(selectedOccasion)) {
    score += 28;
    reasons.push(`works for ${selectedOccasion}`);
  } else if (selectedOccasion && giftText.includes(selectedOccasion)) {
    score += 10;
  }

  const interestMatches = selectedInterests.filter((interest) =>
    giftTags.includes(interest) || giftCategory === interest || giftText.includes(interest)
  );
  if (interestMatches.length) {
    score += interestMatches.length * 24;
    reasons.push(`matches ${interestMatches.slice(0, 2).join(" and ")}`);
  }

  const personalityTags = {
    funny: ["funny", "playful", "gaming", "quirky", "social"],
    romantic: ["romantic", "sentimental", "personalized", "fashion", "photography"],
    practical: ["practical", "useful", "tech", "fitness", "cooking", "home"],
    adventurous: ["adventurous", "travel", "fitness", "nature", "outdoor"],
    artistic: ["artistic", "art", "handmade", "creative", "photography"],
    intellectual: ["intellectual", "books", "stationery", "learning", "classic"],
  };
  const personalityMatches = selectedPersonality
    ? (personalityTags[selectedPersonality] || [selectedPersonality]).filter((tag) =>
        giftTags.includes(tag) || giftText.includes(tag)
      )
    : [];
  if (personalityMatches.length) {
    score += personalityMatches.length * 16;
    reasons.push(`${selectedPersonality} personality`);
  }

  if (price >= minBudget && price <= maxBudget) {
    score += 18;
    const remainingBudget = maxBudget - price;
    if (remainingBudget <= Math.max(500, maxBudget * 0.15)) score += 8;
  } else if (price > maxBudget) {
    score -= 30;
  } else if (price < minBudget) {
    score -= 8;
  }

  return { score, reasons };
};

const fallbackSmartChoice = ({ message, preferences = {}, gifts = [] }) => {
  const rankedGifts = gifts
    .map(cleanGift)
    .map((gift, originalIndex) => {
      const ranking = scoreLocalGift(gift, preferences);
      return { ...gift, originalIndex, smartScore: ranking.score, smartReasons: ranking.reasons };
    })
    .sort((a, b) =>
      b.smartScore - a.smartScore ||
      Number(b.price || 0) - Number(a.price || 0) ||
      a.originalIndex - b.originalIndex
    );
  const normalizedGifts = rankedGifts.slice(0, 5);
  const topGift = normalizedGifts[0];
  const budgetText = preferences.minBudget || preferences.budget
    ? `Rs. ${Number(preferences.minBudget || 0).toLocaleString("en-IN")} to Rs. ${Number(preferences.budget || 0).toLocaleString("en-IN")}`
    : "your budget";
  const topReasons = topGift?.smartReasons?.length
    ? topGift.smartReasons.slice(0, 3).join(", ")
    : "it is the strongest match from the current results";

  return {
    id: Date.now(),
    message: topGift
      ? `My smart choice is ${topGift.name}. It ranks highest because it ${topReasons} and stays around ${budgetText}.`
      : `Tell me a little more about the recipient and I can suggest a stronger gift match. You asked: "${message}"`,
    confidence: topGift ? Math.min(0.95, Math.max(0.55, topGift.smartScore / 120)) : 0.45,
    suggestions: normalizedGifts.map((gift, index) => ({
      id: gift.id || index + 1,
      name: gift.name,
      rank: index + 1,
      score: gift.smartScore,
      reason: gift.smartReasons?.length
        ? `Ranks #${index + 1} because it ${gift.smartReasons.slice(0, 2).join(" and ")}.`
        : gift.reason || gift.description || "Included as a close match from your current results.",
    })),
  };
};

const extractJson = (text = "") => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (_err) {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch (_innerErr) {
      return null;
    }
  }
};

async function askGemini({ message, conversationHistory = [], preferences = {}, gifts = [] }) {
  if (!config.geminiApiKey) {
    throw createError("Gemini API key is not configured.", 503);
  }

  if (Date.now() < geminiDisabledUntil) {
    throw createError("Gemini is cooling down after a quota or billing error.", 503);
  }

  const safeGifts = gifts.slice(0, 12).map(cleanGift);
  const prompt = `
You are INCANTO's smart gift assistant for shoppers in Nepal. Rank the candidate gifts and answer naturally.

Return only valid JSON with this shape:
{
  "message": "short helpful answer",
  "confidence": 0.0,
  "suggestions": [
    { "id": "gift id", "name": "gift name", "rank": 1, "reason": "specific reason" }
  ]
}

Rules:
- Prefer gifts that match recipient, occasion, interests, personality, and budget.
- Use the supplied candidate gifts only. Do not invent products.
- Keep message under 90 words and each reason under 24 words.

User message: ${message}
Finder preferences: ${JSON.stringify(preferences)}
Candidate gifts: ${JSON.stringify(safeGifts)}
Conversation history: ${JSON.stringify(conversationHistory.slice(-6))}
`;

  const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(config.geminiApiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.35,
        topP: 0.9,
        maxOutputTokens: 700,
        responseMimeType: "application/json",
      },
    }),
  });

  const payload = await geminiRes.json().catch(() => ({}));
  if (!geminiRes.ok) {
    const messageText = payload.error?.message || "Gemini request failed.";
    throw createError(messageText, geminiRes.status);
  }

  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
  const parsed = extractJson(text);
  if (!parsed) {
    throw createError("Gemini returned an unreadable response.", 502);
  }

  return {
    id: Date.now(),
    message: parsed.message || "Here are the strongest gift matches from your current results.",
    confidence: Number.isFinite(Number(parsed.confidence)) ? Number(parsed.confidence) : 0.8,
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [],
    source: "gemini",
  };
}

/**
 * AI Gift Chat Endpoint
 * POST /api/v1/ai/chat
 */
router.post("/chat", async (req, res, next) => {
  try {
    const { message, conversationHistory = [], preferences = {}, gifts = [] } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return next(createError("Message is required and must be a non-empty string.", 400));
    }

    let aiProvider = "gemini";
    let fallbackReason = "";
    const response = await askGemini({
      message: message.trim(),
      conversationHistory,
      preferences,
      gifts: Array.isArray(gifts) ? gifts : [],
    }).catch((err) => {
      aiProvider = "local";
      fallbackReason = getGeminiFallbackReason(err);
      noteGeminiFallback(fallbackReason);
      return {
        ...fallbackSmartChoice({
        message: message.trim(),
        preferences,
        gifts: Array.isArray(gifts) ? gifts : [],
        }),
        source: "local",
      };
    });

    res.json({
      success: true,
      message: aiProvider === "gemini" ? "AI response generated" : "Local smart ranking generated",
      data: {
        response,
        aiProvider,
        fallbackReason,
        conversationId: `conv_${Date.now()}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * AI Gift Analysis Endpoint
 * POST /api/v1/ai/analyze
 */
router.post("/analyze", async (req, res, next) => {
  try {
    const { gift, giftId, recipient, occasion, budget, preferences = {} } = req.body;

    if (!gift && !giftId) {
      return next(createError("gift or giftId is required.", 400));
    }

    const selectedGift = cleanGift(gift || { id: giftId });
    const response = await askGemini({
      message: `Analyze this gift for ${recipient || preferences.recipient || "the recipient"} on ${occasion || preferences.occasion || "the occasion"} with budget ${budget || preferences.budget || "unspecified"}.`,
      preferences: { ...preferences, recipient, occasion, budget },
      gifts: [selectedGift],
    }).catch(() => fallbackSmartChoice({
      message: "Analyze gift",
      preferences: { ...preferences, recipient, occasion, budget },
      gifts: [selectedGift],
    }));

    res.json({
      success: true,
      message: "Gift analysis completed",
      data: {
        giftId: selectedGift.id,
        suitabilityScore: response.confidence,
        reasoning: response.message,
        alternatives: response.suggestions,
        sentiment: response.confidence >= 0.7 ? "positive" : "neutral",
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * AI Personality Assessment Endpoint
 * POST /api/v1/ai/personality
 */
router.post("/personality", async (req, res, next) => {
  try {
    const { preferences, history = [] } = req.body;

    if (!preferences) {
      return next(createError("Preferences object is required.", 400));
    }

    const interests = Array.isArray(preferences.interests) ? preferences.interests : [];
    const assessment = {
      primaryType: preferences.personality || "thoughtful",
      secondaryType: interests[0] || "practical",
      traits: [...new Set([preferences.personality, ...interests, preferences.occasion].filter(Boolean))].slice(0, 5),
      confidence: history.length ? 0.8 : 0.7,
      recommendations: "Use the smart choice button after results appear to rank the best gift from the current shortlist.",
    };

    res.json({
      success: true,
      message: "Personality assessment completed",
      data: assessment,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * AI Conversation History Endpoint
 * GET /api/v1/ai/conversations/:id
 */
router.get("/conversations/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(createError("Conversation ID is required.", 400));
    }

    res.json({
      success: true,
      message: "Conversation history is stored in the browser for this prototype.",
      data: {
        id,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * AI Endpoint Info
 * GET /api/v1/ai
 */
router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "AI Gift Assistant API is running",
    model: GEMINI_MODEL,
    endpoints: {
      chat: "POST /api/v1/ai/chat - Chat with Gemini for smart gift ranking",
      analyze: "POST /api/v1/ai/analyze - Analyze gift suitability",
      personality: "POST /api/v1/ai/personality - Get personality assessment",
      conversationHistory: "GET /api/v1/ai/conversations/:id - Get conversation history",
    },
  });
});

export default router;
