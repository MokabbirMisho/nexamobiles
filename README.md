# NexaMobiles — E-commerce Website

Premium new phones & accessories (Apple, Samsung, Vivo, Oppo, Realme) for the German market.
Full-stack MVP, deployed live (Vercel + Render + Neon).

## Stack
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Zustand, Axios
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Auth:** JWT + bcrypt, plus Google sign-in (Google Identity Services)
- **Payments:** Stripe Elements (embedded card form) + PayPal Buttons (official secure popup); falls back to a demo confirm when no real Stripe key is configured
- **Email:** Brevo HTTP API — welcome email on signup + order confirmation with a PDF receipt attached

## Project structure
```
nexamobiles/
├─ client/   React frontend (Vite)
├─ server/   Express API + Prisma
├─ docs/     Blueprint
└─ README.md
```

## Quick start

### 1. Backend
```bash
cd server
# .env already exists — set DATABASE_URL and JWT_SECRET inside it
npm install
npx prisma generate
npx prisma migrate dev --name init   # or: npx prisma db push
npm run seed                  # demo brands/categories/products + admin user
npm run dev                   # http://localhost:5050
```
> Port is **5050** (macOS reserves 5000 for AirPlay, which returns HTTP 403).

### 2. Frontend
```bash
cd client
# .env already exists — VITE_API_URL=http://localhost:5050/api
npm install
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so the default config works out of the box.

## Demo accounts (after seeding)
- **Admin:** [email protected] / admin123
- **Customer:** [email protected] / customer123

## Key flows
- Browse freely → add to cart (guest cart in localStorage) → login at checkout (guest cart merges to server) → create order → pay → order confirmation + email with PDF receipt.
- **Auth:** email/password signup & login, or Google sign-in. A welcome email is sent on registration.
- **My Account** (`/account`): customers can update their name and password (email is fixed) and permanently delete their account.
- **Card:** embedded Stripe Elements form on the checkout page (cardholder name + number + expiry + CVC). Card data goes directly to Stripe — the server never touches raw card numbers (PCI-safe). When no real Stripe key is configured, the order is completed in demo mode (still sends the confirmation email + PDF receipt).
- **PayPal:** official PayPal button that opens PayPal's own secure login popup (we never collect PayPal credentials).
- **Admin:** dashboard, product CRUD, stock management, order status updates, and creating/promoting other admins (`/admin/admins`).

## Environment variables

### server/.env
| Var | Purpose |
|---|---|
| PORT | API port (default 5050) |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | token signing secret |
| STRIPE_SECRET_KEY | Stripe card payments (`sk_test_...`) — leave as placeholder for demo mode |
| PAYPAL_CLIENT_ID / SECRET | PayPal payments |
| BREVO_API_KEY | Brevo HTTP email API key (`xkeysib-...`) |
| EMAIL_FROM | sender, e.g. `NexaMobiles <you@gmail.com>` (must be a verified Brevo sender) |
| GOOGLE_CLIENT_ID | Google sign-in (verifies Google ID tokens) |
| CLIENT_URL | frontend origin (CORS + redirects) |

### client/.env
| Var | Purpose |
|---|---|
| VITE_API_URL | backend API base (http://localhost:5050/api) |
| VITE_STRIPE_PUBLISHABLE_KEY | Stripe public key (`pk_test_...`) — enables the real card form; omit for demo mode |
| VITE_PAYPAL_CLIENT_ID | PayPal client id (`test` for sandbox preview) |
| VITE_GOOGLE_CLIENT_ID | Google OAuth client id — enables the Google sign-in button |

> Payments and email degrade gracefully: if keys are absent the app still runs (demo card confirm, logged emails). Add real keys to enable live payments. Email uses Brevo's HTTP API, which works on hosts (e.g. Render free tier) that block outbound SMTP.

## Test payment details
- **Stripe test card:** 4242 4242 4242 4242 · any future expiry · any CVC
- **PayPal:** use a sandbox buyer account

## Deployment (live)
- **Frontend → Vercel** (Root Directory = `client`; `vercel.json` rewrites all routes to `index.html` for SPA routing). Set `VITE_*` env vars in Vercel; they are baked at build time, so changing one requires a redeploy.
- **Backend → Render** (web service; `postinstall` runs `prisma generate`). Set `DATABASE_URL`, `JWT_SECRET`, `BREVO_API_KEY`, `EMAIL_FROM`, `GOOGLE_CLIENT_ID`, `CLIENT_URL`. Note: Render's free tier blocks outbound SMTP, so email goes through Brevo's HTTP API. The free instance also sleeps when idle and takes ~30–60s to wake on the first request.
- **Database → Neon** (managed PostgreSQL; database name `neondb`). Apply schema changes with `npx prisma db push` then `npx prisma generate`.
