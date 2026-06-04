# Email Verification & Personalized Recommendations System

## Backend Setup

### Environment Variables (add to `.env`)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/incanto
```

## New API Endpoints

### 1. **Email Verification**
- **POST** `/api/v1/users/verify-email`
  - Body: `{ token: "string" }`
  - Response: Returns JWT token and user data when verified

- **POST** `/api/v1/users/resend-verification`
  - Body: `{ email: "user@example.com" }`
  - Response: Sends new verification email

### 2. **Updated Register Endpoint**
- **POST** `/api/v1/users/register`
  - Now sends verification email automatically
  - Returns unverified user status
  - User must verify email before login

### 3. **Updated Login Endpoint**
- **POST** `/api/v1/users/login`
  - Now checks if `isVerified` is true
  - Rejects login if email not verified

### 4. **Preferences Endpoint (Enhanced)**
- **POST** `/api/v1/users/preferences` [Protected]
  - Now accepts `personality` field
  - Stores: `recipient`, `budget`, `interests`, `personality`

### 5. **Recommendations Endpoint (Enhanced)**
- **GET** `/api/v1/gifts/recommendations` [Optional Auth]
  - Now accepts `personality` query parameter
  - Merges query params with stored user preferences (if authenticated)
  - Works without authentication, using only query parameters

## Frontend Flow

### Registration → Email Verification → Personalized Recommendations

1. **User signs up** → Backend sends verification email with token
2. **User clicks link or enters token** → Frontend calls `/verify-email`
3. **Email verified** → User logged in, token stored
4. **User runs gift finder** → Quiz responses saved to preferences
5. **Next time user logs in** → Recommendations automatically use saved preferences

## Database Schema Updates

### User Model
```javascript
{
  username: String,
  email: String,
  password: String,
  isVerified: Boolean,                    // NEW
  verificationToken: String,              // NEW
  verificationTokenExpires: Date,         // NEW
  preferences: {
    recipient: String,
    budget: Number,
    interests: [String],
    personality: String                   // NEW
  }
}
```

## How It Works

### Without Login
- User runs quiz → gets temporary recommendations (stored in localStorage)
- Closes browser → data lost

### With Email Verification & Login
- User registers → receives verification email
- Verifies email → logs in automatically
- Runs quiz → responses saved to database
- Logs out and back in → recommendations automatically pulled from saved preferences
- Can update preferences anytime

## Email Service (nodemailer)

- Supports Gmail, SendGrid, and custom SMTP servers
- Sends HTML-formatted verification emails
- Token expires after 24 hours
- Users can request resend if email lost

