# 🎁 INCANTO – AI Gift Finder

> *Find the perfect gift with the power of AI.*

---

## 🚀 Overview

**INCANTO** is an AI-powered gift recommendation platform that helps users discover personalized gift ideas based on their preferences.

Users simply enter details like:

* Occasion 🎉
* Recipient 👤
* Budget 💰
* Interests 🎯

And INCANTO intelligently suggests the best gifts — along with explanations and purchase links.

---

## ✨ Features

* 🧠 AI-powered gift recommendations
* 🎯 Personalized suggestions based on user input
* 💡 “Why this gift?” explanations
* 💰 Budget-aware filtering
* 🔗 Affiliate-ready “Buy Now” links
* ⚡ Fast and responsive UI
* 🎨 Modern, clean design

---

## 🧩 Tech Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### AI Integration

* OpenAI API

### Data

* JSON-based dataset (`gifts.json`)

---

## 🔁 System Workflow

```text
User Input (Frontend)
        ↓
API Request → Backend (Node.js)
        ↓
Filter Dataset (Budget + Tags)
        ↓
AI Processing (OpenAI)
        ↓
Structured Gift Recommendations
        ↓
Frontend Displays Results
        ↓
User clicks → Affiliate Link 💰
```

---

## 📁 Project Structure

```
incanto-ai-gift-finder/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── data/
│   │   └── gifts.json
│   ├── app.js
│   └── package.json
│
├── docs/
└── README.md
```

---

## 👥 Team & Roles

* **Sulav Nepal** – Project Lead / Product Manager
* **Devashish Bogati** – Backend Developer
* **Diptamshu Sharma** – Integration & Testing
* **Prajana Shrestha** – AI / Logic Engineer
* **Success Biswokarma** – Data & Monetization Engineer

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/incanto-ai-gift-finder.git
cd incanto-ai-gift-finder
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```
OPENAI_API_KEY=your_api_key_here
```

Run server:

```bash
npm start
```

---

### 3. Frontend Setup

Simply open:

```
frontend/index.html
```

OR use Live Server (recommended)

---

## 🔌 API Endpoint

### POST `/generate-gifts`

**Request Body:**

```json
{
  "occasion": "Birthday",
  "recipient": "Friend",
  "budget": 2000,
  "interests": "music, tech",
  "personality": "creative"
}
```

**Response:**

```json
[
  {
    "name": "Wireless Earbuds",
    "description": "High-quality sound earbuds",
    "price": "2000-3000 NPR",
    "reason": "Perfect for music lovers",
    "link": "affiliate_link"
  }
]
```

---

## 🌿 Git Workflow

* `main` → production-ready code
* `dev` → development branch

Each member works on:

```
feature/branch-name
```

### Example:

```
feature/backend-api
feature/ai-logic
feature/dataset
```

---

## 📌 Rules

* ❌ Do not push directly to `main`
* ✅ Always create a branch
* ✅ Use Pull Requests
* ✅ Write clear commit messages

---

## 💰 Monetization

INCANTO uses:

* Affiliate links (Daraz / Amazon)
* “Buy Now” buttons redirect users

---

## 🚀 Future Improvements

* User authentication
* Save favorites
* Real-time AI suggestions
* Mobile app
* Advanced recommendation engine

---

## 🧠 Vision

To build a **smart, AI-powered gifting assistant** that simplifies decision-making and creates meaningful gifting experiences.

---

## 📄 License

This project is for educational and development purposes.

---

## ⭐ Contribute

If you're part of the team:

* Pick an issue
* Create a branch
* Submit a PR

---

## 🔥 Final Note

INCANTO is more than a project — it’s a **product in the making**.

---
