# Salon Ché — website & owner app

Premium website, online booking and owner app for **Salon Ché** (Lee Ortivez, 507 Almond Street, Nampa, ID), built from the *Salon Ché — Website UI* design file. The design's screens and flows are all here, with a more editorial, high-end look: ivory, espresso and champagne, set in Cormorant Garamond and Manrope.

**Stack:** Next.js 15 (App Router, server actions) · Tailwind CSS · Postgres (Neon in production, embedded PGlite when no database is set) · Claude API for the AI assistant · Vercel.

## What's inside

| Area | Pages |
|---|---|
| Client site (base) | `/` home, `/services`, `/about` (Meet Lee), `/work`, `/reviews`, `/visit`, `/policies`, 404 and error pages |
| Booking | `/book` (services → live calendar → consultation → deposit → confirmed), `/book/request` (after-hours), `/book/waitlist` |
| Client account | `/account` sign-in by text code; visits with reschedule, cancel, add-to-calendar and rebook; loyalty card; saved looks; orders and gift cards; messages; settings, including data download and delete |
| Commerce | `/shop`, `/shop/[slug]` (reserve, then pay at pickup), `/gift-cards` (design, note, balance check) |
| Smart | AI assistant on every page (`/api/assistant`), `/try-on` virtual hair-colour studio |
| Owner app | `/owner` today, calendar and block time, new appointment, appointment (take payment, tip, move, no-show), clients and profiles, messages, requests and waitlist, reviews, earnings, orders and stock, hours, prices, booking rules, salon settings, **edit website by text** with undo |
| Proposal | `/features`: every add-on and its price |

### Photos
Owner → **Photos** (`/owner/photos`) changes every photo on the site without code:
- **Site photos**: the 3 hero arches, Meet Lee, About page portrait and the salon room, and one banner photo per service category. Each one can be changed or reset to the original.
- **Work gallery** and **Homepage reel**: add, caption, set a category, reorder or remove photos, then publish.
- **Shop products**: change each product's photo.
- **Library**: your uploads and the built-in photos. A photo that is still used on the site can't be deleted.

Uploads are resized in the browser (longest side 1800px, JPEG) and stored in Postgres. They are served from `/api/media/:id` with long-term caching, so no extra storage service is needed. The built-in photos live in `public/photos/` (Unsplash licence).

### Add-on price tags
The premium base website is one price. **Every feature beyond it has an `Add-on · $X` tag** wherever it appears on the site. All prices are in one file, `lib/features.ts`. To hide the tags once the client has chosen, set `NEXT_PUBLIC_SHOW_PRICE_TAGS=false`.

## Run locally
```bash
npm install
npm run dev          # http://localhost:3000
```
If `DATABASE_URL` is not set, the app starts an embedded Postgres in `./.pglite` and fills it with sample data: services, clients, appointments, reviews and products.

Owner app: `/owner`. The demo password is `salonche`; set `OWNER_PASSWORD` in production.
Demo client: sign in at `/account` with `(208) 555-0142`. The text code appears on screen in demo mode.

## Deploy (Vercel + Neon)
1. Import this repo in Vercel (Framework: Next.js, no settings to change).
2. Add the environment variables from `.env.example`. At minimum set `DATABASE_URL` (the Neon connection string), `OWNER_PASSWORD` and `SESSION_SECRET`.
3. Deploy. On the first request the app creates its tables and adds the sample data by itself. No migration step is needed.

Optional add-on keys: `ANTHROPIC_API_KEY` (AI assistant), `TWILIO_*` (texts), `STRIPE_SECRET_KEY` (payments). Without these keys, each of those features runs in a clearly labelled demo mode.
