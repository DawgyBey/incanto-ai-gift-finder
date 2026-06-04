//backend-services-recommendationService.js

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import config from "../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const giftsPath = join(__dirname, "../data/gifts.json");
let giftsCache = null;

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE REALITY (verified against gifts.json):
//
// Recipients:  'Partner' | 'Friend' | 'Mom' | 'Dad' | 'Sibling' |
//              'Child' | 'Colleague' | 'Grandparent'
// Occasions:   'Birthday' | 'Anniversary' | 'Valentine' | 'Festival' |
//              'Casual' | 'Just Because' | 'Graduation' | 'Wedding' | 'Babyshower'
// Categories:  'Tech' | 'Art' | 'Sport' | 'Food' | 'Clothing' | 'Lifestyle' |
//              'Kitchen' | 'Stationery' | 'Photography' | 'Experience' | 'Baby'
// Tags match interest words directly (e.g. 'cooking', 'fashion', 'fitness')
//
// KEY: Recipients and occasions in DB are arrays and match frontend values
// directly — NO mapping needed. This is different from the old DB.
// ─────────────────────────────────────────────────────────────────────────────

// Frontend interest word → DB Category names that contain relevant gifts
const INTEREST_CATEGORY_MAP = {
  cooking:     ["Food", "Kitchen"],
  food:        ["Food", "Kitchen"],
  music:       ["Tech", "Lifestyle"],
  travel:      ["Sport", "Lifestyle"],
  fitness:     ["Sport", "Lifestyle"],
  art:         ["Art", "Stationery"],
  books:       ["Stationery", "Art"],
  gaming:      ["Tech"],
  fashion:     ["Clothing"],
  tech:        ["Tech"],
  nature:      ["Lifestyle", "Sport"],
  skincare:    ["Lifestyle"],
  photography: ["Photography", "Tech"],
  baby:        ["Baby"],
  wellness:    ["Lifestyle", "Experience"],
  stationery:  ["Stationery", "Art"],
  experience:  ["Experience"],
};

// Frontend personality → DB tags (all lowercase in DB)
const PERSONALITY_TAG_MAP = {
  funny:        ["funny", "trendy", "unique"],
  romantic:     ["romantic", "sentimental", "handmade", "premium"],
  practical:    ["practical", "budget", "useful"],
  adventurous:  ["sport", "travel", "fitness", "unique"],
  artistic:     ["handmade", "art", "traditional", "unique"],
  intellectual: ["intellectual", "books", "study", "stationery"],
};

// Tags that signal romantic suitability — used for valentine/anniversary bonus
const ROMANTIC_TAGS = ["romantic", "sentimental", "premium", "handmade"];

// ─── LOAD & NORMALIZE GIFTS ───────────────────────────────────────────────────

const normalizeText = (text) => String(text || "").trim().toLowerCase();

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean);
  return String(value || "").split(/[,;&]/).map(normalizeText).filter(Boolean);
};

const normalizeGift = (rawGift) => {
  const itemName    = rawGift.item_name || rawGift["Item Name"] || rawGift.name || "Gift";
  const price       = Number(rawGift.price_npr ?? rawGift["Price (NPR)"] ?? rawGift.price ?? 0);
  const imageUrl    = String(rawGift.image_url || rawGift.imageUrl || "").trim();
  const darazLink   = String(rawGift.daraz_search_link || rawGift.link || "").trim();

  // Keep original casing for matching (DB stores 'Partner', 'Birthday' etc.)
  const recipientsRaw = Array.isArray(rawGift.recipient)
    ? rawGift.recipient
    : String(rawGift.recipient || rawGift.Recipient || "").split(/[,;&]/).map(s => s.trim()).filter(Boolean);

  const occasionsRaw = Array.isArray(rawGift.occasion)
    ? rawGift.occasion
    : String(rawGift.occasion || rawGift.Occasion || "").split(/[,;&]/).map(s => s.trim()).filter(Boolean);

  return {
    id:                 rawGift.id,
    item_name:          itemName,
    name:               itemName,
    category:           String(rawGift.category || rawGift.Category || "").trim(),
    // lowercase arrays for matching
    recipients:         recipientsRaw.map(normalizeText),
    occasions:          occasionsRaw.map(r => normalizeText(r).replace(/\s+/g, "")),
    // original casing preserved for display
    recipient:          rawGift.recipient,
    occasion:           rawGift.occasion,
    price,
    price_npr:          price,
    price_range:        rawGift.price_range,
    description:        String(rawGift.description || rawGift.Description || "").trim(),
    availability:       String(rawGift.availability || rawGift.Availability || "").trim(),
    tags:               normalizeList(rawGift.tags || rawGift.Tags),
    image_url:          imageUrl,
    imageUrl,
    daraz_search_link:  darazLink,
    link:               darazLink,
    gender_suitability: Array.isArray(rawGift.gender_suitability) ? rawGift.gender_suitability : [],
    age_group:          Array.isArray(rawGift.age_group) ? rawGift.age_group : [],
    gift_score:         Number(rawGift.gift_score || 0),
    is_local_nepali_gift: Boolean(rawGift.is_local_nepali_gift),
  };
};

const loadGifts = () => {
  if (!giftsCache) {
    const data = JSON.parse(readFileSync(giftsPath, "utf-8"));
    const list = Array.isArray(data) ? data : data.gifts || data.nepal_gift_database || [];
    giftsCache = list.map(normalizeGift);
  }
  return giftsCache;
};

// ─── SCORING ──────────────────────────────────────────────────────────────────

const scoreGift = (gift, {
  normRecipient,        // lowercase e.g. 'partner'
  normOccasion,         // lowercase no-spaces e.g. 'justbecause'
  relevantCats,         // Set of category names e.g. Set{'Clothing'}
  normInterests,        // lowercase array e.g. ['fashion']
  personality,          // string e.g. 'romantic'
  budget,               // number
  isRomanticOccasion,   // bool
}) => {
  // Hard cut: never return gifts over budget
  if (budget !== null && budget !== undefined && gift.price > budget) return -999;

  let score = gift.gift_score / 10; // small base from DB quality score

  // ── Recipient (50 pts) — highest weight ──────────────────────────────────
  if (normRecipient && gift.recipients.includes(normRecipient)) score += 50;

  // ── Occasion (30 pts) ────────────────────────────────────────────────────
  if (normOccasion && gift.occasions.includes(normOccasion)) score += 30;

  // ── Interest → Category (40 pts) ─────────────────────────────────────────
  if (relevantCats.size > 0 && relevantCats.has(gift.category)) score += 40;

  // ── Interest tag match (15 pts each) — tags in new DB match interest words
  if (normInterests.length > 0) {
    score += gift.tags.filter((t) => normInterests.includes(t)).length * 15;
  }

  // ── Personality → tag match (15 pts each) ────────────────────────────────
  if (personality) {
    const pTags = PERSONALITY_TAG_MAP[normalizeText(personality)] || [];
    score += gift.tags.filter((t) => pTags.includes(t)).length * 15;
  }

  // ── Romantic occasion bonus (12 pts per romantic tag) ────────────────────
  if (isRomanticOccasion) {
    score += gift.tags.filter((t) => ROMANTIC_TAGS.includes(t)).length * 12;
  }

  // ── Quality boosts ────────────────────────────────────────────────────────
  if (gift.tags.includes("premium"))  score += 3;
  if (gift.tags.includes("handmade")) score += 3;
  if (gift.tags.includes("trendy"))   score += 2;

  // ── Budget proximity boost (use most of budget = better value) ───────────
  if (budget !== null && budget !== undefined) {
    const headroom = budget - gift.price;
    if (headroom >= 0 && headroom <= 500)  score += 8;
    else if (headroom <= 1500)             score += 4;
  }

  return score;
};

// ─── GEMINI RANKING ───────────────────────────────────────────────────────────

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function rankWithGemini(candidates, { recipient, occasion, budget, interests, personality }) {
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    console.warn("[Incanto] GEMINI_API_KEY not set — using rule-based order.");
    return null;
  }

  const giftList = candidates
    .map(
      (g) =>
        `ID:${g.id} | "${g.name}" | Category:${g.category} | Rs.${g.price} | Tags:${g.tags.join(",")} | ${g.description}`
    )
    .join("\n");

  const system = `You are a gift ranking expert for Incanto, a Nepali gift-finding app.
Rank the provided gifts from BEST to WORST for the buyer's preferences.
Write one short specific reason per gift (1 sentence). Mention the recipient and occasion or interest.
Respond ONLY with valid JSON — no markdown, no extra text.

Format:
{
  "ranked": [
    { "id": 1, "reason": "Perfect for a partner on Valentine's Day — romantic and personal." },
    { "id": 2, "reason": "..." }
  ]
}`;

  const user = `Buyer preferences:
- Recipient: ${recipient || "not specified"}
- Occasion: ${occasion || "not specified"}
- Budget: Rs. ${budget || "flexible"}
- Interests: ${interests?.length ? interests.join(", ") : "none selected"}
- Personality: ${personality || "not specified"}

Rank ALL ${candidates.length} gifts:
${giftList}`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || res.statusText);
    }

    const data = await res.json();
    const raw   = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in Gemini response");

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed.ranked)) throw new Error("Missing ranked array");
    return parsed.ranked;
  } catch (err) {
    console.error("[Incanto] Gemini failed, using rule-based order:", err.message);
    return null;
  }
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export const getRecommendations = async (preferences = {}, options = {}) => {
  const gifts = loadGifts();

  const {
    budget      = null,
    recipient   = null,
    interests   = [],
    personality = null,
    occasion    = null,
  } = preferences;

  const { limit = 10, page = 1, useAI = true } = options;

  // ── Normalise inputs ───────────────────────────────────────────────────────
  const normRecipient = normalizeText(recipient);
  // Normalise occasion: lowercase + remove spaces (so 'Just Because' → 'justbecause')
  const normOccasion  = normalizeText(occasion).replace(/\s+/g, "");

  const normInterests = (interests || []).map(normalizeText).filter(Boolean);

  const relevantCats = new Set(
    normInterests.flatMap((i) => INTEREST_CATEGORY_MAP[i] || [])
  );

  const isRomanticOccasion = ["valentine", "anniversary", "wedding"].includes(normOccasion);

  console.log(`[Incanto] recipient:${recipient} | occasion:${occasion}→${normOccasion} | interests:[${normInterests}]→cats:[${[...relevantCats]}] | romantic:${isRomanticOccasion} | budget:${budget} | useAI:${useAI}`);

  // ── Score every gift ───────────────────────────────────────────────────────
  const POOL_SIZE = 25;

  const allScored = gifts
    .map((g) => ({
      ...g,
      _score: scoreGift(g, {
        normRecipient,
        normOccasion,
        relevantCats,
        normInterests,
        personality,
        budget,
        isRomanticOccasion,
      }),
    }))
    .filter((g) => g._score > -999)
    .sort((a, b) => b._score - a._score || a.price - b.price);

  // ── Build candidate pool ───────────────────────────────────────────────────
  // Interest-matching gifts fill the pool first; romantic gifts float to top
  // when it's a romantic occasion with no interests selected.
  let candidates;

  if (relevantCats.size > 0) {
    const hits   = allScored.filter((g) => relevantCats.has(g.category));
    const others = allScored.filter((g) => !relevantCats.has(g.category));
    candidates = [
      ...hits.slice(0, POOL_SIZE),
      ...others.slice(0, Math.max(0, POOL_SIZE - hits.length)),
    ].slice(0, POOL_SIZE);
  } else if (isRomanticOccasion) {
    const romantic = allScored.filter((g) =>
      g.tags.includes("romantic") || g.tags.includes("sentimental")
    );
    const others = allScored.filter((g) =>
      !g.tags.includes("romantic") && !g.tags.includes("sentimental")
    );
    candidates = [
      ...romantic.slice(0, POOL_SIZE),
      ...others.slice(0, Math.max(0, POOL_SIZE - romantic.length)),
    ].slice(0, POOL_SIZE);
  } else {
    candidates = allScored.slice(0, POOL_SIZE);
  }

  candidates = candidates.map(({ _score, ...g }) => g);

  console.log(`[Incanto] Pool: ${candidates.length} | top 5: ${candidates.slice(0, 5).map((g) => `${g.name}(${g.category})`).join(", ")}`);

  if (candidates.length === 0) {
    return { total: 0, page, totalPages: 0, limit, results: [] };
  }

  // ── Gemini re-ranks (when AI is on) ───────────────────────────────────────
  if (useAI) {
    console.log(`[Incanto] Sending ${candidates.length} gifts to Gemini...`);
    const aiRanking = await rankWithGemini(candidates, {
      recipient,
      occasion,
      budget,
      interests: normInterests,
      personality,
    });

    if (aiRanking) {
      const byId     = Object.fromEntries(candidates.map((g) => [String(g.id), g]));
      const reasonOf = Object.fromEntries(aiRanking.map((r) => [String(r.id), r.reason || ""]));
      const aiIds    = aiRanking.map((r) => String(r.id)).filter((id) => byId[id]);
      const missed   = candidates.filter((g) => !new Set(aiIds).has(String(g.id))).map((g) => String(g.id));

      const results = [...aiIds, ...missed].map((id) => ({
        ...byId[id],
        aiReason: reasonOf[id] || "",
      }));

      // Paginate
      const total      = results.length;
      const totalPages = Math.ceil(total / limit);
      const start      = (page - 1) * limit;

      console.log(`[Incanto] Gemini ranked ${results.length}. Top: ${results[0]?.name}`);
      return { total, page, totalPages, limit, results: results.slice(start, start + limit) };
    }
  }

  // ── AI off or Gemini failed — paginate rule-based results ─────────────────
  const total      = candidates.length;
  const totalPages = Math.ceil(total / limit);
  const start      = (page - 1) * limit;

  console.log(`[Incanto] Rule-based results (useAI=${useAI})`);
  return {
    total,
    page,
    totalPages,
    limit,
    results: candidates.slice(start, start + limit).map((g) => ({ ...g, aiReason: "" })),
  };
};