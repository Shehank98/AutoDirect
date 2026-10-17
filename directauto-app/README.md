# AutoDirect: Japan auction imports for Sri Lanka

Car store + Japan live-auction site. **Storefront and admin are one React single-page app** (no build step)
served by a Node/Express API with PostgreSQL. Firebase is optional and only needed for customer accounts and photo upload.

```
Browser (React SPA)  ->  Express (this repo)  ->  PostgreSQL   vehicles, requests, customers
        |                                     \-> Firebase     OPTIONAL: customer sign-in + photo storage
        \-> /live-auction embeds the JPCenter auction viewer
```

## What's in the box

| Area | Where |
|------|-------|
| Design system + components | `public/app/ad.css`, `public/app/ds.js` |
| Storefront: routing, API client, pages | `public/app/app.js` |
| **Admin console** (lazy-loaded at `/admin`) | `public/app/admin.js` |
| App shell | `public/index.html` (served for every non-file route) |
| Sample car photos | `public/samples/` |
| API | `src/routes/*` (`catalog`, `inquiries`, `account`, `admin`, ...) |
| Schema / seed / migration | `db/` (runs automatically on boot) |
| React 18 (vendored, no CDN) | `public/vendor/` |

### Storefront
Home (hero search, featured cars, live-auction teaser, how to buy, auction-sheet decoder, **Browse by brand / body type /
inventory location**), Our stock (filters incl. location), vehicle page (gallery, specs, loan calculator, quote and viewing form),
Compare, **Live auction** (JPCenter viewer embedded), Request a bid, How to buy, Auction-sheet guide, Vocabulary, About, Contact.
When Firebase is on: Sign in / Register / My account (order tracker). URLs are real paths (`/our-stock/<seo-url>`, `/compare` ...).

### Live auction page
`/live-auction` shows `LIVE_AUCTION_URL` (default `https://jpcenter.ru/on?classic`) in a full-width iframe, with an
"Open in a new tab" fallback. Whether it displays depends on JPCenter allowing itself to be framed, and some browsers
block third-party sign-in cookies inside iframes. If visitors see a blank frame, the new-tab link is the fallback.
`LIVE_AUCTION_HINT` can show a line of text above the frame (for example a guest login).

### Photos
`USE_SAMPLE_IMAGES=true` (default): every listing shows the bundled sample photos, chosen by model or body type. Nothing
stored in the database is used and the admin has no photo upload. Set it to `false` once Firebase Storage is configured to
show real photos.

## Admin (`/admin`)
Sign in with the **`ADMIN_USERNAME` / `ADMIN_PASSWORD`** variables set on the server (see below). The session lasts 12 hours
or until you close the tab, and 8 wrong attempts lock that IP out for 15 minutes.

- **Vehicles**: add, edit, delete, features, sales status (Available, Reserved, In transit, Sold), featured, publish or hide, bulk actions
- **Brands, Models, Body types, Colours, Features**: logo or icon by image URL (upload when Firebase Storage is on)
- **Inquiries / Auction requests**: open one, set the **order stage** (Requested, Bidding, Won, LC opened, Shipped, Arrived, Delivered), ETA and a note
- **Customers** (grant or remove admin) and **Newsletter**, both with CSV export

Changes show on the public site immediately (the catalogue cache is cleared on every admin write).

## Run locally
```bash
cp .env.example .env     # set DATABASE_URL, ADMIN_USERNAME and ADMIN_PASSWORD
npm install
npm start                # http://localhost:3000, creates the schema and loads sample cars
```

## Deploy on Railway
1. **New Project, Deploy from GitHub repo**; service **Root Directory** = `directauto-app`.
2. **New, Database, PostgreSQL**; on the app service add `DATABASE_URL = ${{Postgres.DATABASE_URL}}`.
3. In **Variables** add `ADMIN_USERNAME` and `ADMIN_PASSWORD` (long and random, 8+ characters). Redeploy.
4. Open `https://<your-domain>/admin` and sign in. Health check: `/api/health`.
5. Optional: `SEED_DEMO_DATA=false` before the first boot to skip the 7 sample cars; `SITE_*` variables for contact details.

If `ADMIN_USERNAME` / `ADMIN_PASSWORD` are missing, blank, or the password is a known placeholder, the admin cannot be used
and the server logs a warning at startup.

### Firebase (optional, later)
Turns on customer sign-in (My account, order tracking) and photo upload. Create a Firebase project, enable
**Authentication (Email/Password)** and **Storage**, then set `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_STORAGE_BUCKET` and the
web config variables in `.env.example`. Emails in `ADMIN_EMAILS` become admins only when the email is **verified**.
Sign-up sends a verification email. Then set `USE_SAMPLE_IMAGES=false` to use uploaded photos.

## Email alerts, SEO, chat and analytics
- **Email alerts** (as on the old site): set `SMTP_*` and `NOTIFY_TO` and the team gets an email for every new quote, viewing,
  contact message, sell-your-car request, auction request and newsletter signup, with the customer's email as Reply-To.
  The admin **Inquiries** page shows whether alerts are on and has a **Send test email** button. If the mail server is down,
  customers are not affected (the error is logged).
- **SEO**: `/robots.txt`, a live `/sitemap.xml` (every published car) and, for each page, a server-filled title, description,
  link-preview image (WhatsApp / Facebook) and structured data for cars. Set `SITE_URL` to your public address.
- **Live chat / analytics**: `TAWK_PROPERTY_ID` and `GA_MEASUREMENT_ID` turn on Tawk.to and Google Analytics 4. Both are off by
  default and never load on `/admin`. They set cookies, so consider a consent notice.
- **Reviews**: the seven customer testimonials from the old site live in `src/content/testimonials.json`.

## Security notes
- Admin API requires a signed, expiring token; the credentials are compared in constant time.
- Public forms are rate-limited (15 submissions per 10 minutes per IP). CORS is off (same origin) unless `CORS_ORIGIN` is set.
- Malformed input returns 400, never a 500 (Postgres data errors are mapped centrally in `server.js`).
- No Content-Security-Policy is set on purpose, because the Live auction page embeds a third-party site. Other hardening
  headers are set (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- `npm audit` still reports advisories inside the `firebase-admin` dependency chain. Upgrading it needs Node 22+ and should be
  done and tested when Firebase is switched on.

## Notes
- The storefront loads the whole published catalogue in one request (`GET /api/catalog`, cached for 60 s) and filters in the
  browser. Fine for hundreds of cars; move filtering server-side (`GET /api/vehicles` is already paginated) if stock reaches thousands.
- Saved cars and the compare list live in the browser (localStorage); everything else is in Postgres.
- Pages are rendered in the browser (page titles update per route, but there is no server-side rendering).
- Not built: staff accounts with roles, customer records editable by staff, online payments.
- `public/assets/` holds the previous theme's CSS/JS/fonts (unused) plus a few images older sample data and brand logos still
  reference. The unused CSS/JS/fonts can be deleted.
