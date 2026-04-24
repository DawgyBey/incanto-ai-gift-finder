# 🎁 Incanto — AI Gift Recommendation API

A production-ready REST API for personalized gift recommendations, built with Node.js, Express, MongoDB, and JWT authentication.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Run the server
node server.js
```

> Requires Node.js ≥ 18 and a running MongoDB instance.

---

## 📁 Project Structure

```
incanto-backend/
├── server.js                    # Entry point
├── package.json
├── .env.example
├── models/
│   └── User.js                  # Mongoose User model
├── routes/
│   ├── index.js                 # Route aggregator
│   ├── user.js                  # Auth + profile routes
│   └── gifts.js                 # Recommendations routes
├── middleware/
│   ├── auth.js                  # JWT protection middleware
│   └── errorHandler.js          # Global error handler + createError()
├── services/
│   └── recommendationService.js # Gift scoring + filtering logic
└── data/
    └── gifts.json               # 20 sample gifts dataset
```

---

## 🔐 Environment Variables

| Variable         | Description                          | Default                    |
|------------------|--------------------------------------|----------------------------|
| `PORT`           | Server port                          | `5000`                     |
| `NODE_ENV`       | Environment mode                     | `development`              |
| `CLIENT_ORIGIN`  | CORS allowed origin                  | `*`                        |
| `RAPIDAPI_KEY`   | API key for RapidAPI Daraz service   | —                          |
| `RAPIDAPI_HOST`  | Host for RapidAPI Daraz service      | `daraz-product-details.p.rapidapi.com` |

---

## 💰 Live Pricing Configuration

The system supports live price fetching for Daraz products using RapidAPI. Configure the following environment variables:

- `RAPIDAPI_KEY`: Your API key for RapidAPI Daraz service
- `RAPIDAPI_HOST`: The host for the RapidAPI service (usually `daraz-product-details.p.rapidapi.com`)

If not configured, the system falls back to static prices from `gifts.json`.

For Daraz products, the system uses the RapidAPI service to fetch accurate, up-to-date pricing information. This is more reliable than web scraping and provides better performance.

To use live prices:
1. Sign up for RapidAPI and subscribe to the Daraz Product Details API
2. Add your API key and host to `.env`
3. Ensure gift links in `gifts.json` point to specific Daraz product pages (not search results)

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`

All responses follow this schema:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

---

### Auth Routes

#### `POST /users/register`

Register a new user.

**Request Body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "securepassword123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "username": "alice",
      "email": "alice@example.com",
      "preferences": {
        "recipient": null,
        "budget": null,
        "interests": []
      },
      "createdAt": "2024-06-04T10:00:00.000Z",
      "updatedAt": "2024-06-04T10:00:00.000Z"
    }
  }
}
```

---

#### `POST /users/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "securepassword123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "username": "alice",
      "email": "alice@example.com",
      "preferences": { ... },
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

#### `GET /users/profile` 🔒

Get authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully.",
  "data": {
    "user": {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "username": "alice",
      "email": "alice@example.com",
      "preferences": {
        "recipient": "partner",
        "budget": 100,
        "interests": ["travel", "music"]
      }
    }
  }
}
```

---

#### `POST /users/preferences` 🔒

Update gift recommendation preferences.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "recipient": "partner",
  "budget": 100,
  "interests": ["travel", "music", "wellness"]
}
```

Valid recipients: `partner` | `friend` | `parent` | `child` | `colleague` | `sibling` | `other`

**Response `200`:**
```json
{
  "success": true,
  "message": "Preferences updated successfully.",
  "data": {
    "preferences": {
      "recipient": "partner",
      "budget": 100,
      "interests": ["travel", "music", "wellness"]
    }
  }
}
```

---

### Gift Routes

#### `GET /gifts/recommendations`

Get personalized gift recommendations. Query parameters override stored preferences. Authentication is optional - if authenticated, stored preferences are used as defaults.

**Headers:** `Authorization: Bearer <token>` (optional)

**Query Parameters:**

| Param       | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `budget`    | number | Max price in USD                         |
| `recipient` | string | Recipient type (see valid values above)  |
| `interests` | string | Comma-separated tags (e.g. `music,travel`) |
| `occasion`  | string | Occasion type (e.g. `Birthday`, `Anniversary`) |
| `limit`     | number | Results per page (default: 10, max: 50)  |
| `page`      | number | Page number (default: 1)                 |

**Example Request:**
```
GET /api/v1/gifts/recommendations?budget=80&recipient=partner&interests=travel,music&limit=5
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Recommendations retrieved successfully.",
  "data": {
    "appliedFilters": {
      "budget": 80,
      "recipient": "partner",
      "interests": ["travel", "music"]
    },
    "total": 8,
    "page": 1,
    "totalPages": 2,
    "limit": 5,
    "results": [
      {
        "id": "gift_008",
        "name": "Illustrated World Map Scratch-Off",
        "description": "Large scratch-off world map to reveal countries you've visited. Frameable art piece.",
        "price": 30,
        "currency": "USD",
        "category": "Travel",
        "tags": ["travel", "adventure", "art", "maps", "home"],
        "recipients": ["friend", "partner", "sibling", "colleague"],
        "rating": 4.4,
        "reviewCount": 4102,
        "trending": false,
        "imageUrl": "https://example.com/images/scratch-map.jpg",
        "affiliateUrl": "https://example.com/shop/scratch-map"
      }
    ]
  }
}
```

---

## ⚙️ Recommendation Algorithm

Gifts are scored based on:

| Criterion              | Points |
|------------------------|--------|
| Recipient match        | +30    |
| Each matching interest | +20    |
| Rating ≥ 4.5           | +10    |
| Rating ≥ 4.8           | +5     |
| Trending item          | +15    |
| Over budget            | excluded |

Results are sorted by score descending, then by rating.

---

## 🛡️ Security Features

- **Helmet** — Secure HTTP headers
- **CORS** — Configurable origin whitelist
- **Rate Limiter** — 100 requests per 15 minutes per IP
- **bcrypt** — Password hashing with salt rounds = 12
- **JWT** — Stateless authentication, configurable expiry
- **Input validation** — All endpoints validate required fields
- **Mongoose sanitization** — Schema-level validation

---

## ❗ Error Responses

```json
{
  "success": false,
  "message": "Descriptive error message here."
}
```

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Bad request / missing fields   |
| 401    | Unauthorized / invalid token   |
| 404    | Route not found                |
| 409    | Conflict (duplicate email etc) |
| 422    | Validation error               |
| 429    | Rate limit exceeded            |
| 500    | Internal server error          |
