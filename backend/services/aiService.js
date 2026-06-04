/**
 * AI Service
 * Handles AI-powered gift recommendations and conversational interactions
 */

import config from "../config.js";

/**
 * Parse natural language input to extract gift preferences
 * @param {string} message - User message
 * @returns {Object} Extracted preferences
 */
export const parseGiftPreferences = (message) => {
  // TODO: Implement NLP using OpenAI or HuggingFace
  // For now, using simple pattern matching

  const message_lower = message.toLowerCase();
  const preferences = {
    budget: null,
    recipient: null,
    interests: [],
    personality: null,
    occasion: null,
  };

  // Budget extraction
  const budgetMatch = message_lower.match(/(?:budget|price|under|around)\s*(?:of\s*)?(?:rs|npr)?\s*(\d+)/i);
  if (budgetMatch) {
    preferences.budget = parseInt(budgetMatch[1]);
  }

  // Recipient extraction
  const recipients = ["mom", "dad", "girlfriend", "boyfriend", "wife", "husband", "friend", "brother", "sister"];
  const foundRecipient = recipients.find((r) => message_lower.includes(r));
  if (foundRecipient) {
    preferences.recipient = foundRecipient;
  }

  // Occasion extraction
  const occasions = ["birthday", "anniversary", "valentine", "gift", "present", "wedding"];
  const foundOccasion = occasions.find((o) => message_lower.includes(o));
  if (foundOccasion) {
    preferences.occasion = foundOccasion;
  }

  return preferences;
};

/**
 * Generate AI response for gift queries
 * @param {string} query - User query
 * @param {Array} giftSuggestions - Gift suggestions to discuss
 * @returns {Object} AI response
 */
export const generateAIResponse = (query, giftSuggestions = []) => {
  // TODO: Integrate with OpenAI or HuggingFace for natural responses

  const suggestions = giftSuggestions.slice(0, 3);
  const suggestionText = suggestions
    .map((g, i) => `${i + 1}. ${g.name} (Rs. ${g.price})`)
    .join("\n");

  const response = {
    message: `Based on your request, here are my top recommendations:\n\n${suggestionText}`,
    confidence: 0.8,
    suggestedFollowUps: [
      "Would you like to know more about any of these?",
      "Would you prefer a different price range?",
      "Are you interested in other categories?",
    ],
  };

  return response;
};

/**
 * Score gift relevance based on conversation context
 * @param {Object} gift - Gift object
 * @param {Object} context - Conversation context
 * @returns {number} Relevance score
 */
export const scoreGiftRelevance = (gift, context = {}) => {
  let score = 0;

  const { budget, recipient, interests = [], personality, occasion } = context;

  // Budget check
  if (budget && gift.price > budget) {
    return -1;
  }

  // Recipient match
  if (recipient && gift.recipients && gift.recipients.includes(recipient.toLowerCase())) {
    score += 40;
  }

  // Occasion match
  if (occasion && gift.occasion && gift.occasion.toLowerCase() === occasion.toLowerCase()) {
    score += 30;
  }

  // Interest match
  if (interests && interests.length > 0) {
    const matchedInterests = gift.tags.filter((tag) => interests.includes(tag.toLowerCase()));
    score += matchedInterests.length * 15;
  }

  // Personality match
  if (personality && gift.tags) {
    if (gift.tags.some((tag) => tag.toLowerCase().includes(personality.toLowerCase()))) {
      score += 25;
    }
  }

  return score;
};

/**
 * Validate AI API keys are configured
 * @returns {Object} Configuration status
 */
export const validateAIConfig = () => {
  return {
    openaiConfigured: !!config.openaiApiKey,
    huggingfaceConfigured: !!config.huggingfaceApiKey,
    canMakeAIRequests: !!config.openaiApiKey || !!config.huggingfaceApiKey,
  };
};

/**
 * Format conversation history for AI processing
 * @param {Array} messages - Messages array
 * @returns {string} Formatted history
 */
export const formatConversationHistory = (messages = []) => {
  return messages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");
};
