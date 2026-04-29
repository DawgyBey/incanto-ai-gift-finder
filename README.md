# Incanto – AI Gift & Product Finder

Incanto is an AI-powered gift and product discovery platform that helps users find relevant products quickly through intelligent recommendations and real-time e-commerce data integration. It reduces the usual “scroll forever until you regret life choices” experience of online shopping.

## Features

* AI-based product and gift recommendations
* Real-time product data integration from e-commerce sources
* Google OAuth authentication for user login
* Backend API built with Node.js and Express
* Structured JSON dataset handling for products
* Scalable architecture for future database expansion

## Tech Stack

* Frontend: React
* Backend: Node.js, Express
* Authentication: Google OAuth
* Data: JSON-based (extendable to MongoDB / SQL)
* APIs: E-commerce product APIs (e.g., Daraz or alternatives)

## Project Structure

```
Incanto/
│
├── backend/        # Node.js + Express API
├── frontend/       # React frontend
├── data/           # JSON datasets
├── .gitignore
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/incanto.git
cd incanto
```

### 2. Backend setup

```bash
cd backend
npm install
npm start
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the backend folder:

```
PORT=5000
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
API_KEY=your_api_key
```

Important: don’t commit this file unless you enjoy leaking secrets publicly (some people do, but we’re pretending you’re not one of them).

## Purpose

Built as an innovation-focused project to simplify gift selection and product discovery using AI logic and live product data, making online shopping slightly less painful.

## Status

Actively in development. Features and integrations are continuously being improved, debugged, and occasionally fixed after Git incidents.
