# Incanto Backend API Documentation

## Overview

Incanto is an AI-powered gift recommendation system with a comprehensive REST API for managing users, gifts, recommendations, and AI-assisted gift selection.

**API Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api/v1`

---

## Quick Start

### Installation

```bash
cd backend
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
AUTH_TOKEN_SECRET=your-super-secret-key
```

### Running the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The API will be available at `http://localhost:5000`

---

## API Endpoints

### Health & Status

#### Health Check
```
GET /health
```

Returns server status and environment information.

**Response:**
```json
{
  "success": true,
  "message": "Incanto API is running",
  "environment": "development",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### API Info
```
GET /api/v1
```

Returns available API routes and versions.

---

## User Authentication & Management

### Base URL: `/api/v1/users`

#### Register User
```
POST /api/v1/users/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Requirements:**
- Username: non-empty string
- Email: valid email format
- Password: minimum 8 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "tokenType": "Bearer",
    "expiresIn": 604800,
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "verified": false,
      "provider": "password",
      "personalInfo": {},
      "preferences": {},
      "recentlyViewed": [],
      "cart": []
    }
  }
}
```

---

#### Login
```
POST /api/v1/users/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "tokenType": "Bearer",
    "expiresIn": 604800,
    "user": { ... }
  }
}
```

---

#### Google OAuth Login
```
POST /api/v1/users/google
Content-Type: application/json
```

**Request Body:**
```json
{
  "credential": "google-jwt-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "Bearer-token",
    "user": { ... }
  }
}
```

---

#### Get User Profile
```
GET /api/v1/users/profile
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

#### Update Preferences
```
POST /api/v1/users/preferences
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "recipient": "mom",
  "budget": 2000,
  "interests": ["jewelry", "skincare"],
  "personality": "practical",
  "occasion": "birthday"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Preferences saved.",
  "data": {
    "user": { ... }
  }
}
```

---

#### Update Personal Info
```
POST /api/v1/users/personal-info
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9841234567",
  "address": "Kathmandu, Nepal"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Personal information saved.",
  "data": {
    "user": { ... }
  }
}
```

---

#### Add to Recently Viewed
```
POST /api/v1/users/recently-viewed
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "giftId": "gift-id-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gift added to recently viewed."
}
```

---

#### Add to Cart
```
POST /api/v1/users/cart
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "giftId": "gift-id-123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gift added to cart."
}
```

---

#### Remove from Cart
```
DELETE /api/v1/users/cart/:giftId
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gift removed from cart."
}
```

---

## Gift Recommendations

### Base URL: `/api/v1/gifts`

#### Get Recommendations
```
GET /api/v1/gifts/recommendations?budget=2000&recipient=mom&interests=jewelry,skincare&personality=practical&occasion=birthday&limit=10&page=1
```

**Query Parameters:**
- `budget` (number, optional): Maximum price
- `recipient` (string, optional): Gift recipient
- `interests` (string, optional): Comma-separated interests
- `personality` (string, optional): Recipient personality
- `occasion` (string, optional): Gift occasion
- `limit` (number, optional): Results per page (default: 10, max: 50)
- `page` (number, optional): Page number (default: 1)

**Response (200):**
```json
{
  "success": true,
  "message": "Recommendations retrieved successfully.",
  "data": {
    "appliedFilters": {
      "budget": 2000,
      "recipient": "mom",
      "interests": ["jewelry", "skincare"],
      "personality": "practical",
      "occasion": "birthday"
    },
    "total": 45,
    "page": 1,
    "totalPages": 5,
    "limit": 10,
    "results": [
      {
        "id": "gift-123",
        "name": "Gold Bracelet",
        "category": "Jewelry",
        "occasion": "birthday",
        "recipients": ["mom", "wife"],
        "price": 1500,
        "description": "Beautiful gold bracelet",
        "availability": "In Stock",
        "tags": ["jewelry", "luxury", "gift"],
        "imageUrl": "",
        "link": "https://..."
      }
    ]
  }
}
```

---

## Gift Database

### Base URL: `/api/v1/data`

#### Get All Gifts
```
GET /api/v1/data/gifts?category=jewelry&occasion=birthday&maxPrice=5000&limit=20&offset=0
```

**Query Parameters:**
- `category` (string, optional): Filter by category
- `occasion` (string, optional): Filter by occasion
- `recipient` (string, optional): Filter by recipient
- `maxPrice` (number, optional): Maximum price filter
- `limit` (number, optional): Results per page (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Response (200):**
```json
{
  "success": true,
  "message": "Gifts retrieved successfully",
  "data": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "results": [...]
  }
}
```

---

#### Get Single Gift
```
GET /api/v1/data/gifts/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gift retrieved successfully",
  "data": { ... }
}
```

---

#### Get Categories
```
GET /api/v1/data/categories
```

**Response (200):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "total": 15,
    "categories": ["Jewelry", "Electronics", "Books", ...]
  }
}
```

---

#### Get Occasions
```
GET /api/v1/data/occasions
```

**Response (200):**
```json
{
  "success": true,
  "message": "Occasions retrieved successfully",
  "data": {
    "total": 9,
    "occasions": ["Birthday", "Anniversary", "Valentine", ...]
  }
}
```

---

#### Get Recipients
```
GET /api/v1/data/recipients
```

**Response (200):**
```json
{
  "success": true,
  "message": "Recipients retrieved successfully",
  "data": {
    "total": 11,
    "recipients": ["mom", "dad", "friend", ...]
  }
}
```

---

#### Get Database Statistics
```
GET /api/v1/data/stats
```

**Response (200):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalGifts": 500,
    "priceStats": {
      "min": 100,
      "max": 50000,
      "average": 5000,
      "median": 2500
    },
    "categories": 15,
    "occasions": 9
  }
}
```

---

## AI Assistant

### Base URL: `/api/v1/ai`

#### Chat with AI
```
POST /api/v1/ai/chat
Authorization: Bearer {token} (optional)
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "I want to buy a gift for my mom's birthday with a budget of 2000",
  "conversationHistory": []
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "AI response generated",
  "data": {
    "response": {
      "id": 1234567890,
      "message": "I'd be happy to help! Based on your preferences...",
      "confidence": 0.85,
      "suggestions": [...]
    },
    "conversationId": "conv_1234567890"
  }
}
```

---

#### Analyze Gift
```
POST /api/v1/ai/analyze
Content-Type: application/json
```

**Request Body:**
```json
{
  "giftId": "gift-123",
  "recipient": "mom",
  "occasion": "birthday",
  "budget": 2000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Gift analysis completed",
  "data": {
    "giftId": "gift-123",
    "suitabilityScore": 0.85,
    "reasoning": "This gift matches...",
    "alternatives": [],
    "sentiment": "positive"
  }
}
```

---

#### Get Personality Assessment
```
POST /api/v1/ai/personality
Content-Type: application/json
```

**Request Body:**
```json
{
  "preferences": {
    "personality": "practical",
    "budget": 2000
  },
  "history": []
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Personality assessment completed",
  "data": {
    "primaryType": "practical",
    "secondaryType": "adventurous",
    "traits": ["budget-conscious", "trend-aware"],
    "confidence": 0.75,
    "recommendations": "..."
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

| Status | Message | Description |
|--------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server error |

---

## Authentication

### Token Usage

Include the token in the `Authorization` header:

```
Authorization: Bearer {token}
```

### Token Lifetime

- **Expiration:** 7 days
- **Refresh:** Obtain a new token by logging in again

---

## Rate Limiting

- **Window:** 15 minutes
- **Limit:** 100 requests per window
- **Response:** 429 Too Many Requests

---

## Environment Variables

See `.env.example` for all available configuration options:

```env
# Server
PORT=5000
NODE_ENV=development

# Client
CLIENT_ORIGIN=http://localhost:3000

# Auth
AUTH_TOKEN_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# AI Services
OPENAI_API_KEY=your-api-key
HUGGINGFACE_API_KEY=your-api-key
```

---

## Best Practices

1. **Always validate input** on the client side before sending requests
2. **Use HTTPS** in production
3. **Rotate secrets** regularly
4. **Handle errors gracefully** with appropriate status codes
5. **Cache responses** when possible
6. **Use pagination** for large datasets
7. **Monitor rate limits** to avoid blocking

---

## Support & Debugging

### Health Check
Test if the API is running:
```bash
curl http://localhost:5000/health
```

### Logs
Check server logs for detailed error information in development mode.

### Contact
For issues and questions, please refer to the project README.

---

## Version History

**v1.0.0** - Initial release
- User authentication (email, Google OAuth)
- Gift recommendations with AI scoring
- Gift database and metadata endpoints
- AI-powered gift assistant
- User profiles and preferences
