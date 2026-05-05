# 🎁 Incanto — AI Gift Recommendation API

A production-ready REST API for personalized gift recommendations, built with Node.js, Express, and AI-powered gift suggestions.

**Features:**
- 🔐 JWT Authentication & Google OAuth
- 🤖 AI-powered gift recommendations
- 🎯 Advanced gift filtering and scoring
- 📊 User preferences management
- 🛒 Shopping cart and wishlist
- 🌐 RESTful API with comprehensive documentation

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.0.0
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your configuration

# 3. Run the server
npm run dev    # Development mode (with auto-reload)
npm start      # Production mode
```

### Verify Installation

```bash
curl http://localhost:5000/health
```

---

## 📁 Project Structure

```
backend/
├── server.js                      # Express app entry point
├── config.js                      # Centralized configuration
├── db.js                          # Database connection module
├── package.json
├── .env                           # Environment variables (DO NOT COMMIT)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── API_DOCUMENTATION.md           # Full API reference
│
├── routes/
│   ├── index.js                   # Route aggregator
│   ├── user.js                    # Auth, profile, preferences
│   ├── gifts.js                   # Gift recommendations
│   ├── data.js                    # Gift database & metadata
│   └── ai.js                      # AI assistant endpoints
│
├── middleware/
│   ├── auth.js                    # JWT/token utilities
│   ├── errorHandler.js            # Error handler & createError()
│   └── (more middleware here)
│
├── services/
│   ├── recommendationService.js   # Gift scoring & filtering
│   ├── aiService.js               # AI operations & NLP
│   ├── pricingService.js          # Price analysis
│   └── (more services here)
│
├── models/
│   ├── schemas.js                 # MongoDB schema definitions
│   └── (mongoose models here)
│
├── constants/
│   └── index.js                   # App-wide constants
│
├── utils/
│   └── helpers.js                 # Utility functions
│
├── data/
│   ├── gifts.json                 # Gift database
│   └── users.json                 # User data (dev only)
│
└── node_modules/                  # Dependencies (auto-generated)
```

---

| Variable         | Description                          | Default                    |
|------------------|--------------------------------------|----------------------------|
| `PORT`           | Server port                          | `5000`                     |
| `NODE_ENV`       | Environment (development/production) | `development`              |
| `CLIENT_ORIGIN`  | CORS allowed origin                  | `*`                        |
| `AUTH_TOKEN_SECRET` | JWT signing secret (min 32 chars) | `incanto-dev-secret`       |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID               | -                          |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret           | -                          |
| `MONGODB_URI`    | MongoDB connection string (optional) | `mongodb://localhost:27017/incanto` |
| `OPENAI_API_KEY` | OpenAI API key (optional)            | -                          |
| `HUGGINGFACE_API_KEY` | HuggingFace API key (optional)    | -                          |

See `.env.example` for all configuration options.

---

## 📡 API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

### Endpoint Groups

| Group | Purpose |
|-------|---------|
| `/users` | User authentication, profiles, preferences |
| `/gifts` | AI-powered gift recommendations |
| `/data` | Gift database, categories, metadata |
| `/ai` | AI chat, analysis, personality assessment |

### Full API Documentation

For complete endpoint documentation with request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## 🔒 Authentication

### JWT Token Flow

1. **Register** or **Login** → receive JWT token
2. Include token in `Authorization: Bearer <token>` header
3. Token expires in 7 days
4. Refresh by logging in again

### Protected Routes

Routes marked with 🔒 require valid JWT token:

```bash
# Example: Get user profile
curl -H "Authorization: Bearer your_token_here" \
  http://localhost:5000/api/v1/users/profile
```

### Google OAuth

1. User clicks "Sign in with Google"
2. Frontend receives Google credential token
3. Send to `POST /api/v1/users/google` with token
4. Receive JWT and user data

---

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
# Runs with Node --watch for auto-reload on file changes
```

### Production Mode
```bash
npm start
# Single start - no auto-reload
```

### Health Check
```bash
# Verify server is running
curl http://localhost:5000/health

# Expected response:
{
  "success": true,
  "message": "Incanto API is running",
  "environment": "development",
  "timestamp": "2024-06-04T10:00:00.000Z"
}
```

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.19.2 | Web framework |
| cors | ^2.8.5 | CORS middleware |
| helmet | ^7.1.0 | Security headers |
| express-rate-limit | ^7.3.1 | Rate limiting |
| dotenv | ^16.4.5 | Environment variables |
| axios | ^1.15.2 | HTTP requests |
| cheerio | ^1.2.0 | Web scraping |
| crypto | ^1.0.1 | Built-in Node module |
| mongoose | ^8.4.1 | MongoDB ODM (optional) |

---

## 🏗️ Project Architecture

### Request Flow

```
Client Request
    ↓
CORS & Security (Helmet)
    ↓
Rate Limiter
    ↓
Body Parser (JSON)
    ↓
Route Handler
    ↓
[Authentication Middleware] (if protected)
    ↓
Business Logic / Service
    ↓
Response
    ↓
Error Handler (if error)
    ↓
JSON Response
```

### Service Layer

- **recommendationService.js** — Gift scoring, filtering, ranking
- **aiService.js** — NLP, preference parsing, response generation
- **pricingService.js** — Price analysis and live pricing

### Middleware

- **auth.js** — JWT signing, verification, token management
- **errorHandler.js** — Global error handler, error creation

---

## 🔧 Configuration & Setup Tips

### Windows Users
Use `npm run dev` or `npm start`. The `--watch` flag works on Windows 10+ with Node 18+.

### Custom Port
```bash
PORT=3001 npm run dev
```

### Production Deployment
1. Set `NODE_ENV=production` in `.env`
2. Use strong `AUTH_TOKEN_SECRET` (min 32 characters)
3. Set `CLIENT_ORIGIN` to your frontend domain
4. Enable HTTPS
5. Monitor rate limits and adjust as needed

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (Linux/Mac)
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Errors
Check `.env` — `CLIENT_ORIGIN` must match your frontend URL exactly.

### JWT Errors
- Token expired? Login again
- Invalid token? Check if header is `Authorization: Bearer <token>`
- Secret mismatch? Verify `AUTH_TOKEN_SECRET` in `.env`

### Database Connection Issues
- MongoDB URI incorrect? Check `.env`
- MongoDB not running? Start MongoDB service
- Network issue? Check firewall/VPN

---

## 📊 Recommendation Algorithm

The gift recommendation engine scores gifts based on:

| Factor | Score |
|--------|-------|
| Exact recipient match | +40 |
| Occasion match | +20 |
| Each interest match | +25 |
| Personality match | +20 |
| Price within budget | +10 |
| Premium/Trendy tags | +5 |
| Over budget | -∞ (excluded) |

Gifts are then ranked by:
1. Score (highest first)
2. Price (lowest first)
3. Name (alphabetical)

---

## 🛡️ Security

### Best Practices
- ✅ Helmet — Secure HTTP headers
- ✅ CORS — Origin whitelist
- ✅ Rate Limiting — 100 req/15 min
- ✅ Password Hashing — PBKDF2 with 120,000 iterations
- ✅ JWT Tokens — Signed with HMAC-SHA256
- ✅ Input Validation — All endpoints validate
- ✅ Error Messages — Non-sensitive in production

### Environment Variables Security
- Never commit `.env` to version control
- Use `.env.example` as template
- Rotate secrets regularly in production
- Use unique secrets per environment

---

## 📈 Performance Tips

1. **Caching** — Gift data is cached in memory
2. **Pagination** — Always use limit/offset for large datasets
3. **Indexes** — Future MongoDB indexes on email, gift ID
4. **Async/Await** — All async operations handled properly
5. **Connection Pooling** — Built into Express/MongoDB

---

## 🤝 Contributing

1. Follow existing code style
2. Add tests for new features
3. Update API_DOCUMENTATION.md for new endpoints
4. Commit with clear messages

---

## 📝 License

Proprietary - All rights reserved

---

## 🆘 Support

For issues, bugs, or feature requests:
1. Check existing issues
2. Review API_DOCUMENTATION.md
3. Check .env configuration
4. Review server logs in development mode

