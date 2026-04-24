import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pricingService } from "./pricingService.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const giftsPath = join(__dirname, "../data/gifts.json");

let giftsCache = null;

const normalizeRecipient = (recipient) =>
  String(recipient || "").trim().toLowerCase();

const normalizeTags = (tags) =>
  String(tags || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

const normalizeGift = (rawGift) => {
  const recipients = Array.isArray(rawGift.Recipient)
    ? rawGift.Recipient.map(normalizeRecipient)
    : String(rawGift.Recipient || "")
        .split(/[,;&]/)
        .map(normalizeRecipient)
        .filter(Boolean);

  const occasion = String(rawGift.Occasion || rawGift.occasion || "").trim();
  if (occasion.toLowerCase() === "anniversary") {
    recipients.push("partner");
  }

  return {
    id: rawGift.id,
    name: rawGift["Item Name"] || rawGift.name || "Gift",
    category: String(rawGift.Category || rawGift.category || "").trim(),
    occasion: occasion,
    recipients: recipients.length > 0 ? recipients : ["other"],
    price: Number(rawGift["Price (NPR)"] ?? rawGift.price ?? 0),
    description: String(rawGift.Description || rawGift.description || "").trim(),
    availability: String(rawGift.Availability || rawGift.availability || "").trim(),
    tags: normalizeTags(rawGift.Tags || rawGift.tags),
    imageUrl: String(rawGift.image_url || rawGift.imageUrl || "").trim(),
    link: String(rawGift.daraz_search_link || rawGift.link || "").trim(),
  };
};

const loadGifts = () => {
  if (!giftsCache) {
    const raw = readFileSync(giftsPath, "utf-8");
    const data = JSON.parse(raw);
    const giftList = Array.isArray(data)
      ? data
      : data.nepal_gift_database || data.gifts || [];
    giftsCache = giftList.map(normalizeGift);
  }
  return giftsCache;
};

const personalityTagMap = {
  funny: ["funny", "quirky", "playful"],
  romantic: ["romantic", "sentimental", "personalized", "luxury"],
  practical: ["practical", "budget", "useful", "everyday"],
  adventurous: ["adventure", "travel", "outdoor", "experiential"],
  artistic: ["artistic", "creative", "design", "handmade"],
  intellectual: ["intellectual", "books", "learning", "tech"],
};

const occasionRecipientMap = {
  "birthday": ["friend", "dad", "mom", "sibling", "colleague", "child"],
  "anniversary": ["partner", "wife", "husband"],
  "valentine": ["partner", "wife", "husband"],
  "festival": ["mom", "dad", "family", "other"],
  "casual": ["friend", "colleague", "sibling"],
  "wedding": ["partner", "wife", "husband", "family"],
  "graduation": ["friend", "sibling", "child"],
  "christmas": ["mom", "dad", "sibling", "family"],
  "new year": ["friend", "family", "colleague"],
};

const scoreGift = (gift, { budget, recipient, interests, personality, occasion }) => {
  let score = 0;

  if (budget !== null && budget !== undefined && gift.price > budget) {
    return -1;
  }

  const normalizedRecipient = normalizeRecipient(recipient);
  if (normalizedRecipient && gift.recipients.includes(normalizedRecipient)) {
    score += 40;
  }

  const normalizedOccasion = String(occasion || "").trim().toLowerCase();
  if (normalizedOccasion && gift.occasion.toLowerCase() === normalizedOccasion) {
    score += 20;
  }

  // Occasion-recipient compatibility check
  if (normalizedOccasion && occasionRecipientMap[normalizedOccasion]) {
    const allowedRecipients = occasionRecipientMap[normalizedOccasion].map(normalizeRecipient);
    const hasCompatibleRecipient = gift.recipients.some(rec => allowedRecipients.includes(rec));
    if (!hasCompatibleRecipient) {
      return -1; // Exclude gift if no compatible recipient
    }
  }

  const normalizedInterests = (interests || []).map((i) => String(i).trim().toLowerCase()).filter(Boolean);
  if (normalizedInterests.length > 0) {
    const matchedTags = gift.tags.filter((tag) => normalizedInterests.includes(tag));
    score += matchedTags.length * 25;

    if (normalizedInterests.includes(gift.category.toLowerCase())) {
      score += 15;
    }

    if (normalizedInterests.includes(gift.occasion.toLowerCase())) {
      score += 10;
    }
  }

  if (personality) {
    const normalizedPersonality = String(personality).trim().toLowerCase();
    const personalityTags = personalityTagMap[normalizedPersonality] || [];
    const personalityMatches = gift.tags.filter((tag) => personalityTags.includes(tag));
    score += personalityMatches.length * 20;
  }

  if (gift.tags.includes("premium")) score += 5;
  if (gift.tags.includes("trendy")) score += 5;
  if (gift.tags.includes("budget")) score += 5;

  if (budget !== null && budget !== undefined) {
    const delta = Math.max(0, budget - gift.price);
    if (delta <= 500) score += 10;
    else if (delta <= 1500) score += 5;
  }

  return score;
};

export const getRecommendations = async (preferences = {}, options = {}) => {
  let gifts = loadGifts();
  const { budget = null, recipient = null, interests = [], personality = null, occasion = null } = preferences;
  const { limit = 10, page = 1 } = options;

  // Update prices with live data
  gifts = await pricingService.updateAllPrices(gifts);

  const scored = gifts
    .map((gift) => ({
      ...gift,
      score: scoreGift(gift, { budget, recipient, interests, personality, occasion }),
    }))
    .filter((gift) => gift.score >= 0)
    .sort((a, b) => b.score - a.score || a.price - b.price || a.name.localeCompare(b.name));

  const total = scored.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const results = scored.slice(start, start + limit).map(({ score, ...gift }) => gift);

  return {
    total,
    page,
    totalPages,
    limit,
    results,
  };
};
