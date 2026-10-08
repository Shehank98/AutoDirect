# AutoDirect — Japan auction imports for Sri Lanka

Car store + Japan live-auction request site. **Storefront and admin are one React single-page app**
(no build step) served by a Node/Express API, backed by PostgreSQL, with Firebase for sign-in and image storage.

```
Browser (React SPA)  ──►  Express (this repo)  ──►  PostgreSQL   vehicles, requests, customers, lots
        │                                      └►  Firebase     Auth (sign-in) + Storage (photos)
        └─ Firebase Auth (browser SDK) ──────────┘
```

## What's in the box

| Area | Where |
|------|-------|
| Design system + components (from the Claude design) | `public/app/ad.css`, `public/app/ds.js` |
| Storefront: routing, API client, auth, pages | `public/app/app.js` |
| **Admin console** (lazy-loaded at `/admin`) | `public/app/admin.js` |
| App shell | `public/index.html` (served for every non-file route) |
| API | `src/routes/*` — `catalog` (public), `inquiries`, `lots`, `account`, `admin` |
| Schema / seed / migration | `db/` (runs automatically on boot) |
| React 18 (vendored, no CDN) | `public/vendor/` |

### Storefront pages
Home (hero search, featured, auction floor, how-to-buy, auction-sheet decoder, **Browse by brand / body type / inventory location**),
Our stock (filters incl. location), vehicle detail (gallery, specs, loan calculator, quote/viewing form), Compare, Live auction
(proxy bids), Request a bid, How to buy, Auction-sheet guide, Vocabulary, About, Contact, Sign in / Register, My account
(inquiries with order tracker, auction requests, saved cars, profile).

URLs are real paths (`/our-stock/<seo-url>`, `/compare`, `/my-account` …), so old links keep working.

### Browse section (bottom of the home page)
Tiles for every brand, body type and location with live counts of published cars; clicking one opens Our stock pre-filtered
(`/our-stock?make=Toyota`, `?type=SUV`, `?location=Japan`). Brands/types with no stock are tucked behind "Show N more".
Brand logos and body-type icons are uploaded in the admin; locations are listed in `src/locations.js`.

### Admin (`/admin`)
Sign in with a Firebase account whose email is in `ADMIN_EMAILS` (or that another admin switched on under **Customers**).
- **Vehicles** – add/edit/delete, photos (cover + reorder), features, sales status (Available / Reserved / In transit / Sold), featured, publish/hide, bulk actions
- **Brands, Models, Body types, Colours, Features** – with logo/icon upload
- **Auction floor** – lots with countdown; customers place proxy bids on them
- **Inquiries / Auction requests** – open one, set the **order stage** (Requested → Bidding → Won → LC opened → Shipped → Arrived → Delivered), ETA and a note; the customer sees it in My account
- **Customers** (grant/revoke admin) and **Newsletter** — both with CSV export

Photos go to Firebase Storage; removing a photo or deleting a vehicle deletes the file too.

## Run locally
```bash
cp .env.example .env     # set DATABASE_URL (+ Firebase when you want sign-in / uploads)
npm install
npm start                # http://localhost:3000 — creates the schema and loads sample cars
```
Without Firebase variables the public site works fully; sign-in, bids and the admin need Firebase.

## Deploy on Railway
1. **New Project → Deploy from GitHub repo**; service **Root Directory** = `directauto-app`.
2. **New → Database → PostgreSQL**; on the app service add `DATABASE_URL = ${{Postgres.DATABASE_URL}}`.
3. Add the Firebase variables below, set `ADMIN_EMAILS`, redeploy. Health check: `/api/health`.
4. Set `SEED_DEMO_DATA=false` before the first boot if you don't want the 7 sample cars.

### Firebase
1. Create a project → enable **Authentication → Email/Password** and **Storage**.
2. **Project settings → Service accounts → Generate new private key** → paste the JSON (single line) into `FIREBASE_SERVICE_ACCOUNT`; set `FIREBASE_STORAGE_BUCKET`.
3. **Project settings → General → Web app** → copy the config into `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`.
4. `ADMIN_EMAILS=you@example.com` — those emails become admins on first sign-in. Register that account on `/register`, then open `/admin`.

See `.env.example` for every variable (contact details, yen rate, demo data).

## Notes
- The storefront loads the whole published catalogue in one request (`GET /api/catalog`) and filters in the browser — instant and
  fine for hundreds of cars. If stock grows into the thousands, move filtering to `GET /api/vehicles` (already paginated).
- Saved cars and the compare list live in the browser (localStorage); everything else is in Postgres.
- Page titles update per route, but pages are rendered in the browser (no server-side rendering).
- Not built: outgoing email notifications for inquiries, online payments.
- `public/assets/` still holds the previous theme's CSS/JS/fonts (unused by the app) plus images that older sample data and brand
  logos reference; the unused CSS/JS/fonts can be deleted.
