# Local Connect — Agri Marketplace

A production-ready full-stack web application connecting farmers directly to buyers. Built with React (Vite), Node.js/Express, MongoDB, Firebase Authentication, and Cloudinary.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, Tailwind CSS, Zustand |
| Backend | Node.js + Express 5 |
| Database | MongoDB + Mongoose |
| Auth | Firebase Auth (Google + Phone OTP) |
| Media | Cloudinary (images & videos) |
| Security | Helmet, CORS, Rate Limiting, JWT, Joi |

## Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (Atlas or local)
- **Firebase** project (with Auth enabled for Google and Phone)
- **Cloudinary** account

## Setup

### 1. Clone & Install

```bash
git clone <repo-url>
cd local-connect

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Backend Environment

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Fill in your credentials:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<db>
JWT_SECRET=<your-secret>

# Firebase Admin SDK (either JSON or individual fields)
FIREBASE_SERVICE_ACCOUNT_JSON=<json-string>
# OR
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CORS_ORIGIN=http://localhost:3000
```

### 3. Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=/api

VITE_FIREBASE_API_KEY=<your-key>
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
VITE_FIREBASE_APP_ID=<app-id>
```

### 4. Run

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000, proxies /api → :5000)
cd frontend && npm run dev
```

Open **http://localhost:3000**

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/firebase-login` | — | Send Firebase ID token, get JWT |

### Profile
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/profile/me` | ✅ | Get current user profile |
| PUT | `/api/profile/update` | ✅ | Update profile (multipart) |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/posts/create` | ✅ | Create listing (multipart) |
| GET | `/api/posts/all` | — | Get all listings |
| GET | `/api/posts/:id` | — | Get single listing |
| PUT | `/api/posts/:id` | ✅ | Update listing (owner) |
| DELETE | `/api/posts/:id` | ✅ | Delete listing (owner) |

## MongoDB Collections

- **farmer_users** — Account info + Firebase UID
- **profileinfos** — Extended profile (farm, bio, etc.)
- **farmerposts** — Marketplace listings with Cloudinary URLs

## Project Structure

```
backend/
  config/       → db.js, firebase.js, cloudinary.js
  controllers/  → authController, profileController, postController
  middleware/   → authMiddleware, uploadMiddleware
  models/       → FarmerUser, ProfileInfo, FarmerPost
  routes/       → authRoutes, profileRoutes, postRoutes
  utils/        → errorHandler
  server.js

frontend/src/
  pages/        → AuthPage, MarketplacePage, ProfilePage, FarmerDashboard, ...
  services/     → api.js (re-export)
  utils/        → api.js (axios + named API functions)
  stores/       → appStore.js (Zustand)
  firebase.js   → Firebase client config
```

## Auth Flow

1. User signs in via Firebase (Google or Phone OTP)
2. Frontend sends Firebase ID token to `POST /api/auth/firebase-login`
3. Backend verifies token with Firebase Admin SDK
4. Backend finds/creates user in MongoDB + auto-creates profile
5. Backend returns JWT session token
6. Frontend stores JWT and uses it for all authenticated requests
