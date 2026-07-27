# MediStore — Medicines, Supplements & Cosmetics E-commerce

A full-stack online pharmacy/cosmetics store built with **Next.js 16 (App
Router) + TypeScript + Tailwind CSS v4**, a **SQLite** database, and a
professional **admin dashboard** with sales analytics and returns/refund
management.

## Quick start

```bash
npm install
npm run db:seed     # creates data/store.db and fills it with demo data
npm run dev          # http://localhost:3000
```

An `.env.local` with a working `AUTH_SECRET` is already included, so it runs
immediately with no extra setup.

### Demo accounts

| Role     | Email                  | Password   |
|----------|-------------------------|-----------|
| Admin    | admin@medistore.test    | Admin@123 |
| Customer | sara@medistore.test     | Demo@123  |

Visit `/admin` after signing in as the admin account to see the dashboard.

## What's included

**Storefront**
- Home, full shop with search/filter/sort/pagination, product detail pages
- Cart (persisted client-side) + dedicated cart page + slide-over drawer
- Checkout with delivery details, coupon codes (`WELCOME10`, `HEALTH20`),
  and cash-on-delivery / mock card payment
- Account area: order history, order tracking, return/refund requests
- Light/dark theme toggle, fully responsive layout

**Auth**
- Email/password signup and login (bcrypt-hashed passwords)
- Optional "Continue with Google" — add `GOOGLE_CLIENT_ID` /
  `GOOGLE_CLIENT_SECRET` to `.env.local` to enable it; the store works fully
  without them
- Role-based route protection (`/admin` is admin-only, `/account` requires
  sign-in) via middleware

**Admin dashboard** (`/admin`)
- Overview: revenue trend chart, orders-by-status breakdown, revenue by
  category, top products, low-stock and pending-order alerts
- Products: create, edit, delete, feature, mark prescription-required
- Orders: filter by status, update status (auto-restocks on cancellation)
- Returns & refunds: approve, reject, or mark refunded (auto-restocks on
  refund)
- Customers: list with lifetime order count and spend

## Tech notes

- **Database**: uses Node's built-in `node:sqlite` module (no native
  compilation step, works out of the box). Requires **Node 22.5+**. Data
  lives in `data/store.db`; delete it and re-run `npm run db:seed` to reset.
- **Auth**: NextAuth v5, split into an edge-safe config (`src/auth.config.ts`,
  used by middleware) and the full DB-backed config (`src/auth.ts`).
- **Styling**: Tailwind v4 with a custom design system (see
  `src/app/globals.css`) — a pharmacy/apothecary palette (deep green +
  coral) with Fraunces/Inter/JetBrains Mono, self-hosted via `@fontsource`
  so there's no runtime dependency on Google Fonts.
- Product images are placeholder photography from `picsum.photos` (seeded
  per-product for consistency) — swap in real product photography before
  going to production, and update `next.config.ts`'s `images.remotePatterns`
  if you host images elsewhere.

## Project structure

```
src/
  app/                 routes (storefront, account, admin, API)
  components/
    site/              storefront UI (header, cart, product card, forms)
    admin/              admin dashboard UI
    ui/                shared primitives (button, input, badge, card)
    providers/          theme + session providers
  lib/
    db/                SQLite schema, queries, seed script
    utils.ts, auth-guard, category-icons
  store/cart.ts        zustand cart store (persisted to localStorage)
  types/               shared TypeScript types
```

## Production build

```bash
npm run build
npm run start
```

This is a demo project — no real payments are processed, and the Google
OAuth integration is optional/inactive until you supply real credentials.
