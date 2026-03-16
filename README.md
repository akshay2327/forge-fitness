# FORGE Fitness — Production Platform

Full-stack fitness management platform built with Next.js 14, Node.js/Express, MongoDB Atlas, and Razorpay.

## Architecture

```
forge-fitness/
├── frontend/          # Next.js 14 App Router
├── backend/           # Node.js + Express REST API
└── docs/              # Setup guides & schemas
```

## Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-org/forge-fitness
cd forge-fitness/frontend && npm install
cd ../backend && npm install
```

### 2. Environment Setup
Copy `.env.example` → `.env.local` (frontend) and `.env.example` → `.env` (backend)
Fill in all values — see docs/ENVIRONMENT.md

### 3. Database Setup
```bash
# MongoDB Atlas — create free cluster at mongodb.com/atlas
# Copy connection string to MONGODB_URI in backend .env
```

### 4. Run Development
```bash
# Terminal 1 — Backend
cd backend && npm run dev   # http://localhost:5000

# Terminal 2 — Frontend
cd frontend && npm run dev  # http://localhost:3000
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | SSR/SSG, routing, React |
| Styling | Tailwind CSS + CSS Modules | Design system |
| Auth | NextAuth.js v5 | Sessions, OAuth, JWT |
| Backend | Node.js + Express | REST API |
| Database | MongoDB Atlas | Primary data store |
| ODM | Mongoose | Schema + validation |
| Cache | Redis (Upstash) | Sessions, rate limiting |
| File Storage | Cloudinary | Progress photos, avatars |
| PDF | Puppeteer | Fitness reports |
| Email | Resend | Transactional emails |
| Payments | Razorpay | Membership subscriptions |
| Hosting | Vercel (frontend) | Edge deployment |
| API Host | Railway | Backend containers |
| Monitoring | Sentry | Error tracking |

## Deployment

See `docs/DEPLOYMENT.md` for step-by-step Vercel + Railway deployment.
