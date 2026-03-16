# FORGE Fitness — Deployment Guide

## Overview

| Service | Provider | Cost |
|---------|----------|------|
| Frontend | Vercel | Free tier |
| Backend API | Railway | $5/month |
| Database | MongoDB Atlas | Free (M0) |
| File Storage | Cloudinary | Free (25GB) |
| Email | Resend | Free (3k/month) |
| Payments | Razorpay | 2% per transaction |

---

## Step 1 — MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → Create free account
2. Build a Database → **M0 Free** tier → Region: **Mumbai (ap-south-1)**
3. Create a database user:
   - Username: `forge_user`
   - Password: Generate a strong password (save it!)
4. Network Access → Add IP Address → **0.0.0.0/0** (allow all — Railway needs this)
5. Connect → Drivers → Copy the connection string:
   ```
   mongodb+srv://forge_user:<password>@cluster0.xxxxx.mongodb.net/forge_fitness
   ```
6. Replace `<password>` with your actual password

---

## Step 2 — Cloudinary Setup

1. Sign up at https://cloudinary.com (free 25GB)
2. Dashboard → Copy: Cloud name, API Key, API Secret
3. Settings → Upload → Add upload preset:
   - Name: `forge_fitness_uploads`
   - Signing Mode: **Unsigned**
4. Add to your env files

---

## Step 3 — Resend Email Setup

1. Sign up at https://resend.com (free: 3,000 emails/month)
2. Domains → Add Domain → Follow DNS setup for `forgefitness.com`
   - OR use `@resend.dev` subdomain for testing (no domain needed)
3. API Keys → Create API Key → Copy it
4. Add `RESEND_API_KEY` to backend `.env`

---

## Step 4 — Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project: "FORGE Fitness"
3. APIs & Services → OAuth consent screen:
   - User Type: External
   - App name: FORGE Fitness
   - Support email: your email
4. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://forgefitness.com/api/auth/callback/google` (production)
5. Copy Client ID and Client Secret to your env files

---

## Step 5 — Razorpay Setup

1. Sign up at https://razorpay.com
2. Complete KYC (required for live payments)
3. Dashboard → Settings → API Keys → Generate Test Key
4. Copy Key ID and Key Secret to backend `.env`
5. For webhooks: Dashboard → Webhooks → Add webhook URL:
   - URL: `https://your-api.railway.app/api/v1/payments/webhook`
   - Events: `payment.captured`, `subscription.cancelled`

---

## Step 6 — Deploy Backend to Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Sign up at https://railway.app (GitHub login)
3. In your backend folder:
   ```bash
   cd forge-fitness/backend
   railway login
   railway init          # Create new project
   railway add           # Add MongoDB plugin (or use Atlas URI)
   ```
4. Add all environment variables in Railway dashboard → Variables
5. Deploy:
   ```bash
   railway up
   ```
6. Get your API URL: `https://forge-fitness-backend.up.railway.app`
7. Add a `railway.toml` in `/backend`:
   ```toml
   [build]
   builder = "NIXPACKS"

   [deploy]
   startCommand = "npm start"
   healthcheckPath = "/health"
   healthcheckTimeout = 30
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 3
   ```

---

## Step 7 — Deploy Frontend to Vercel

1. Push code to GitHub (make sure `.env.local` is in `.gitignore`)
2. Go to https://vercel.com → New Project → Import from GitHub
3. Root Directory: `forge-fitness/frontend`
4. Framework Preset: **Next.js**
5. Add all environment variables in Vercel dashboard → Settings → Environment Variables
   - Set `NEXT_PUBLIC_API_URL` to your Railway backend URL
   - Set `NEXTAUTH_URL` to your Vercel domain
6. Deploy!

---

## Step 8 — Run Database Seed

After both services are running:
```bash
cd forge-fitness/backend
# Set production env
cp .env.example .env
# Edit .env with production values

npm run seed
```

Output:
```
✅ Admin created: admin@forgefitness.com
✅ Trainer created: marcus@forgefitness.com
✅ Demo member created: demo@forgefitness.com
```

---

## Step 9 — Custom Domain (Optional)

### Vercel (Frontend)
- Settings → Domains → Add `forgefitness.com`
- Add DNS records at your domain registrar (Vercel will show you exactly what to add)

### Railway (Backend)
- Settings → Networking → Add custom domain: `api.forgefitness.com`
- Update `FRONTEND_URL` in backend env to `https://forgefitness.com`
- Update `NEXT_PUBLIC_API_URL` in frontend env to `https://api.forgefitness.com/api/v1`

---

## Environment Variable Checklist

### Backend `.env`
- [ ] `MONGODB_URI` — MongoDB Atlas connection string
- [ ] `JWT_SECRET` — 64 char random hex
- [ ] `JWT_REFRESH_SECRET` — another 64 char random hex
- [ ] `GOOGLE_CLIENT_ID` — from Google Console
- [ ] `GOOGLE_CLIENT_SECRET` — from Google Console
- [ ] `RAZORPAY_KEY_ID` — from Razorpay dashboard
- [ ] `RAZORPAY_KEY_SECRET` — from Razorpay dashboard
- [ ] `CLOUDINARY_CLOUD_NAME` — from Cloudinary
- [ ] `CLOUDINARY_API_KEY` — from Cloudinary
- [ ] `CLOUDINARY_API_SECRET` — from Cloudinary
- [ ] `RESEND_API_KEY` — from Resend
- [ ] `ADMIN_EMAIL` — your admin email
- [ ] `ADMIN_PASSWORD` — strong password
- [ ] `FRONTEND_URL` — production frontend URL

### Frontend `.env.local`
- [ ] `NEXTAUTH_SECRET` — 32 char random base64
- [ ] `NEXTAUTH_URL` — production URL
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `MONGODB_URI` — same as backend
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- [ ] `RAZORPAY_KEY_SECRET`
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_API_URL` — backend API URL

---

## Security Checklist (Pre-Launch)

- [ ] All `.env` files are in `.gitignore`
- [ ] MongoDB Atlas IP whitelist is set (not 0.0.0.0/0 in production if possible)
- [ ] Razorpay switched from Test to Live keys
- [ ] Google OAuth redirect URIs updated to production domain
- [ ] `NODE_ENV=production` in Railway
- [ ] HTTPS enforced on all domains
- [ ] Rate limiting is active on auth endpoints
- [ ] Admin password is strong and changed from default
- [ ] Cloudinary unsigned upload preset restricted to your domain

---

## Useful Commands

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate NextAuth secret
openssl rand -base64 32

# Check Railway logs
railway logs

# Local development
cd backend  && npm run dev   # port 5000
cd frontend && npm run dev   # port 3000
```
