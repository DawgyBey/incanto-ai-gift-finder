import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const giftsPath = join(__dirname, "data/gifts.json");
const data = JSON.parse(readFileSync(giftsPath, "utf8"));
const gifts = Array.isArray(data) ? data : data.gifts || data.nepal_gift_database || [];

const requiredFields = [
  "id",
  "item_name",
  "category",
  "recipient",
  "price_npr",
  "occasion",
  "description",
  "availability",
  "tags",
  "image_url",
  "daraz_search_link",
  "price_range",
  "gender_suitability",
  "age_group",
  "gift_score",
  "is_local_nepali_gift",
];

const errors = [];
const ids = new Set();
const names = new Set();
const imagePattern = /^(\/[A-Za-z0-9/_-]+\.(jpg|jpeg|png|webp)|https?:\/\/[^\s]+)$/i;

const addError = (index, message) => {
  const id = gifts[index]?.id ?? `index ${index}`;
  errors.push(`Gift ${id}: ${message}`);
};

gifts.forEach((gift, index) => {
  requiredFields.forEach((field) => {
    if (!(field in gift)) addError(index, `missing required field "${field}"`);
  });

  if (ids.has(gift.id)) addError(index, "duplicate id");
  ids.add(gift.id);

  const normalizedName = String(gift.item_name || "").trim().toLowerCase();
  if (!normalizedName) addError(index, "empty item_name");
  if (names.has(normalizedName)) addError(index, "duplicate item_name");
  names.add(normalizedName);

  if (typeof gift.price_npr !== "number" || !Number.isFinite(gift.price_npr)) {
    addError(index, "price_npr must be a number");
  }

  ["recipient", "occasion", "tags", "gender_suitability", "age_group"].forEach((field) => {
    if (!Array.isArray(gift[field]) || gift[field].length === 0) {
      addError(index, `${field} must be a non-empty array`);
    }
  });

  if (!String(gift.description || "").trim()) addError(index, "description cannot be empty");
  if (!String(gift.image_url || "").trim()) addError(index, "image_url cannot be empty");
  if (!imagePattern.test(String(gift.image_url || ""))) {
    addError(index, "image_url must be a local image path or valid URL");
  }

  const link = String(gift.daraz_search_link || "");
  if (!link.startsWith("https://www.daraz.com.np/catalog/?q=")) {
    addError(index, "daraz_search_link must be a Daraz catalog search URL");
  }

  if (!["Budget", "Mid Range", "Premium"].includes(gift.price_range)) {
    addError(index, "price_range must be Budget, Mid Range, or Premium");
  }

  if (typeof gift.gift_score !== "number" || gift.gift_score < 1 || gift.gift_score > 10) {
    addError(index, "gift_score must be a number from 1 to 10");
  }

  if (typeof gift.is_local_nepali_gift !== "boolean") {
    addError(index, "is_local_nepali_gift must be a boolean");
  }
});

if (errors.length > 0) {
  console.error(`Gift validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Gift validation passed for ${gifts.length} gifts.`);
