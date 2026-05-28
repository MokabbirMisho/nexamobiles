# NexaMobiles — E-commerce Website

Premium new phones & accessories (Apple, Samsung, Vivo, Oppo, Realme) for the German market.
Full-stack MVP built to the project blueprint.

## Stack
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Zustand, Axios
- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Auth:** JWT + bcrypt
- **Payments:** Stripe Elements (embedded card form: cardholder name, number, expiry, CVC) + PayPal Buttons (official secure popup)
- **Email:** Resend (order confirmation)

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
- Browse freely → add to cart (guest cart in localStorage) → login at checkout (guest cart merges to server) → create order → pay → order confirmation + email.
- **Card:** embedded Stripe Elements form on the checkout page (cardholder name + number + expiry + CVC). Card data goes directly to Stripe — the server never touches raw card numbers (PCI-safe). Without a Stripe key, a visual preview form is shown instead.
- **PayPal:** official PayPal button that opens PayPal's own secure login popup (we never collect PayPal credentials).
- Admin: dashboard, product CRUD, stock management, order status updates.

## Environment variables

### server/.env
| Var | Purpose |
|---|---|
| PORT | API port (default 5050) |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | token signing secret |
| STRIPE_SECRET_KEY | Stripe card payments (`sk_test_...`) |
| PAYPAL_CLIENT_ID / SECRET | PayPal payments |
| RESEND_API_KEY | transactional email |
| CLIENT_URL | frontend origin (CORS + redirects) |

### client/.env
| Var | Purpose |
|---|---|
| VITE_API_URL | backend API base (http://localhost:5050/api) |
| VITE_STRIPE_PUBLISHABLE_KEY | Stripe public key (`pk_test_...`) — enables the real card form |
| VITE_PAYPAL_CLIENT_ID | PayPal client id (`test` for sandbox preview) |

> Payments and email degrade gracefully: if keys are absent the app still runs (mock card form, logged emails). Add real keys to enable live payments.

## Test payment details
- **Stripe test card:** 4242 4242 4242 4242 · any future expiry · any CVC
- **PayPal:** use a sandbox buyer account

## Deployment (later)
- Frontend → Vercel / Netlify
- Backend → Render / Railway / VPS
- Database → Managed PostgreSQL (Neon, Supabase, Railway)
