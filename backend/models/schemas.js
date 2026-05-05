/**
 * MongoDB Schemas (For future database integration)
 * These schemas define the structure for MongoDB collections
 */

/**
 * User Schema
 * Defines the structure for user documents in the database
 */
export const userSchema = {
  _id: "ObjectId",
  id: "String (UUID)",
  username: "String",
  email: "String",
  passwordHash: "String (nullable for OAuth users)",
  verified: "Boolean",
  provider: "String (password, google, password+google)",
  personalInfo: {
    firstName: "String",
    lastName: "String",
    dateOfBirth: "Date",
    phone: "String",
    address: "String",
  },
  preferences: {
    recipient: "String",
    budget: "Number",
    interests: ["String"],
    personality: "String",
    occasion: "String",
    updatedAt: "Date",
  },
  recentlyViewed: ["ObjectId (Gift IDs)"],
  cart: [
    {
      giftId: "ObjectId",
      quantity: "Number",
      addedAt: "Date",
    },
  ],
  createdAt: "Date",
  updatedAt: "Date",
  lastLogin: "Date",
};

/**
 * Gift Schema
 * Defines the structure for gift documents in the database
 */
export const giftSchema = {
  _id: "ObjectId",
  id: "String",
  name: "String",
  category: "String",
  occasion: "String",
  recipients: ["String"],
  price: "Number",
  description: "String",
  availability: "String",
  tags: ["String"],
  imageUrl: "String",
  link: "String",
  rating: "Number (0-5)",
  reviews: "Number",
  createdAt: "Date",
  updatedAt: "Date",
};

/**
 * Conversation Schema
 * Defines the structure for AI conversation documents in the database
 */
export const conversationSchema = {
  _id: "ObjectId",
  id: "String (UUID)",
  userId: "ObjectId (User ID)",
  messages: [
    {
      role: "String (user, assistant)",
      content: "String",
      timestamp: "Date",
    },
  ],
  metadata: {
    recipient: "String",
    budget: "Number",
    occasion: "String",
  },
  createdAt: "Date",
  updatedAt: "Date",
  expiresAt: "Date (TTL index)",
};

/**
 * Order Schema
 * Defines the structure for order documents (future e-commerce feature)
 */
export const orderSchema = {
  _id: "ObjectId",
  id: "String (UUID)",
  userId: "ObjectId (User ID)",
  items: [
    {
      giftId: "ObjectId",
      quantity: "Number",
      price: "Number",
    },
  ],
  totalPrice: "Number",
  status: "String (pending, confirmed, shipped, delivered, cancelled)",
  shippingAddress: "String",
  paymentMethod: "String",
  createdAt: "Date",
  deliveredAt: "Date",
};
