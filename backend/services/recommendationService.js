import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const giftsPath = join(__dirname, "../data/gifts.json");

let giftsCache = null;

const normalizeText = (text) => String(text || "").trim().toLowerCase();

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.map(normalizeText).filter(Boolean);
  return String(value || "")
    .split(/[,;&]/)
    .map(normalizeText)
    .filter(Boolean);
};

const buildRecipientAliases = (recipients) => {
  const aliasSet = new Set(recipients);

  if (recipients.some((r) => ["mom", "dad"].includes(r))) aliasSet.add("parent");
  if (recipients.some((r) => ["partner", "wife", "husband"].includes(r))) aliasSet.add("partner");
  if (recipients.some((r) => ["mom", "dad", "sibling", "child", "partner", "wife", "husband", "family"].includes(r))) {
    aliasSet.add("family");
  }

  return Array.from(aliasSet);
};

const normalizeGift = (rawGift) => {
  const itemName = rawGift.item_name || rawGift["Item Name"] || rawGift.name || "Gift";
  const recipients = normalizeList(rawGift.recipient || rawGift.Recipient || rawGift.recipients);
  const occasions = normalizeList(rawGift.occasion || rawGift.Occasion || rawGift.occasions);

  const price = Number(rawGift.price_npr ?? rawGift["Price (NPR)"] ?? rawGift.price ?? 0);
  const imageUrl = String(rawGift.image_url || rawGift.imageUrl || "").trim();
  const darazLink = String(rawGift.daraz_search_link || rawGift.link || "").trim();

  return {
    id: rawGift.id,
    item_name: itemName,
    name: itemName,
    category: String(rawGift.category || rawGift.Category || "").trim(),
    recipient: Array.isArray(rawGift.recipient) ? rawGift.recipient : rawGift.Recipient,
    recipients: buildRecipientAliases(recipients.length ? recipients : ["other"]),
    occasion: Array.isArray(rawGift.occasion) ? rawGift.occasion : rawGift.Occasion,
    occasions,
    price,
    price_npr: price,
    price_range: rawGift.price_range,
    description: String(rawGift.description || rawGift.Description || "").trim(),
    availability: String(rawGift.availability || rawGift.Availability || "").trim(),
    tags: normalizeList(rawGift.tags || rawGift.Tags),
    image_url: imageUrl,
    imageUrl,
    daraz_search_link: darazLink,
    link: darazLink,
    gender_suitability: Array.isArray(rawGift.gender_suitability) ? rawGift.gender_suitability : [],
    age_group: Array.isArray(rawGift.age_group) ? rawGift.age_group : [],
    gift_score: Number(rawGift.gift_score || 0),
    is_local_nepali_gift: Boolean(rawGift.is_local_nepali_gift),
  };
};

const loadGifts = () => {
  if (!giftsCache) {
    const raw = readFileSync(giftsPath, "utf-8");
    const data = JSON.parse(raw);
    const giftList = Array.isArray(data) ? data : data.gifts || data.nepal_gift_database || [];
    giftsCache = giftList.map(normalizeGift);
  }
  return giftsCache;
};

const personalityTagMap = {
  funny: ["funny", "quirky", "playful", "gaming", "trendy"],
  romantic: ["romantic", "sentimental", "personalized", "luxury", "fashion", "photography"],
  practical: ["practical", "budget", "useful", "everyday", "tech", "kitchen"],
  adventurous: ["adventure", "adventurous", "travel", "outdoor", "sport", "fitness"],
  artistic: ["artistic", "creative", "design", "handmade", "art", "photography"],
  intellectual: ["intellectual", "books", "learning", "tech", "stationery", "study"],
};

const occasionRecipientMap = {
  birthday: ["friend", "dad", "mom", "sibling", "colleague", "child", "partner", "grandparent"],
  anniversary: ["partner", "wife", "husband"],
  valentine: ["partner", "wife", "husband"],
  festival: ["mom", "dad", "family", "friend", "colleague", "child", "grandparent"],
  casual: ["friend", "colleague", "sibling", "partner"],
  "just because": ["friend", "colleague", "sibling", "partner", "family"],
  justbecause: ["friend", "colleague", "sibling", "partner", "family"],
  wedding: ["friend", "sibling", "colleague", "family", "partner"],
  graduation: ["friend", "sibling", "child", "colleague", "partner"],
  babyshower: ["partner", "friend", "sibling", "colleague"],
};

const matchesPersonality = (gift, personality) => {
  if (!personality) return true;
  const normalizedPersonality = normalizeText(personality);
  const personalityTags = personalityTagMap[normalizedPersonality] || [normalizedPersonality];
  return gift.tags.some((tag) => personalityTags.includes(tag));
};

const scoreGift = (gift, preferences) => {
  const {
    budget = null,
    minBudget = null,
    recipient = null,
    interests = [],
    personality = null,
    occasion = null,
    category = null,
    tags = [],
    availability = null,
    preferOnline = false,
    preferLocal = false,
  } = preferences;

  let score = Number(gift.gift_score || 0) / 10;
  const normalizedRecipient = normalizeText(recipient);
  const normalizedOccasion = normalizeText(occasion).replace(/\s+/g, "");
  const normalizedCategory = normalizeText(category);
  const normalizedAvailability = normalizeText(availability);
  const requestedTags = [...normalizeList(interests), ...normalizeList(tags)];
  const maxBudget = budget !== null && budget !== undefined ? Number(budget) : null;
  const lowerBudget = minBudget !== null && minBudget !== undefined ? Number(minBudget) : null;

  if (normalizedRecipient) {
    score += gift.recipients.includes(normalizedRecipient) ? 3 : -2;
  }

  if (normalizedOccasion) {
    const giftOccasions = gift.occasions.map((value) => value.replace(/\s+/g, ""));
    score += giftOccasions.includes(normalizedOccasion) ? 3 : -2;
  }

  if (maxBudget !== null && Number.isFinite(maxBudget)) {
    if (gift.price <= maxBudget && (lowerBudget === null || gift.price >= lowerBudget)) score += 2;
    if (gift.price > maxBudget) score -= 4;
  }

  if (normalizedCategory && normalizeText(gift.category) === normalizedCategory) score += 1;

  requestedTags.forEach((tag) => {
    if (gift.tags.includes(tag) || normalizeText(gift.category) === tag) score += 1;
  });

  if (personality) score += matchesPersonality(gift, personality) ? 1 : -1;

  if (normalizedAvailability && normalizeText(gift.availability).includes(normalizedAvailability)) score += 1;

  if (preferOnline && ["daraz", "both"].some((source) => normalizeText(gift.availability).includes(source))) score += 1;
  if (preferLocal && gift.is_local_nepali_gift) score += 1;

  if (normalizedOccasion && occasionRecipientMap[normalizedOccasion]) {
    const allowedRecipients = occasionRecipientMap[normalizedOccasion].map(normalizeText);
    const hasCompatibleRecipient = gift.recipients.some((rec) => allowedRecipients.includes(rec));
    if (!hasCompatibleRecipient) score -= 2;
  }

  return score;
};

export const getRecommendations = async (preferences = {}, options = {}) => {
  const gifts = loadGifts();
  const { limit = 10, page = 1 } = options;

  const scored = gifts
    .map((gift) => ({
      ...gift,
      score: scoreGift(gift, preferences),
    }))
    .filter((gift) => gift.score > -2)
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
