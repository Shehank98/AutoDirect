# DirectAuto Import — rebuilt (HTML/CSS/JS + Node/Express + PostgreSQL + Firebase)

A fresh rebuild of the DirectAuto Import car store & Japan live-auction site, keeping the
original design and features but on a modern stack. Everything lives in this one folder.

## Architecture

```
Browser (HTML/CSS/JS)  ──►  Node/Express (this app)  ──►  PostgreSQL   (vehicle data, inquiries, profiles)
        │                                              └►  Firebase     (Auth = login, Storage = car images)
        └──────────────────  Firebase Auth (browser SDK) ──┘
```

- **Frontend** — static HTML/CSS/JS in `public/` (reuses the original theme in `public/assets`).
- **API** — Express routes under `/api` (`src/routes`), backed by Postgres (`db/`).
- **Auth** — Firebase Authentication. The browser signs in; the server verifies the ID token
  (`src/auth.js` + `src/firebase.js`) and keys a `profiles` row by the Firebase UID.
- **Images** — uploaded to Firebase Storage from the admin API (`/api/admin/upload`); the URL
  is stored in Postgres.

## What's built (phases)

| Phase | Status | Includes |
|-------|--------|----------|
| 1 — Buyer site | ✅ Done | Home, Our Stock (filters, sort, pagination), Vehicle detail + inquiry, Contact, About, How-to-Buy, Auction-sheet guide, Vocabulary, Compare, Newsletter, Live-auction request |
| 2 — Accounts | ✅ Mostly done | Firebase login/register, My Account dashboard (profile, my inquiries, auction requests). *Turns on once Firebase env vars are set.* |
| 3 — Admin panel | ✅ Done | `/admin` — dashboard, vehicle add/edit/hide/delete with multi-image upload (Firebase Storage), inquiries, auction requests, and management of brands (with logos), models, body types, colours and features. |
| Browse section | ✅ Done | Bottom of the home page: **Browse by car brand / body type / inventory location**, each tile with a live vehicle count linking to a pre-filtered Our Stock. |

## Admin panel

Open **`/admin`** and sign in with a Firebase email/password account whose email is listed in
`ADMIN_EMAILS` (create that user once under Firebase → Authentication → Users, or via `/register`).
Other accounts are rejected. Images uploaded in the admin go to Firebase Storage
(`vehicles/`, `brands/`, `types/`); removing an image from a vehicle, or deleting the vehicle,
deletes the file from Storage too.

## Browse by brand / body type / location

- Brands and body types come from the admin **Brands** / **Body types** pages; upload a logo/icon there
  (brands without a logo show their initial). The first deploy adds the standard 24 brands and 13 body
  types once — afterwards the admin owns them.
- Inventory locations (Japan, Korea, Singapore, Thailand, China, UK, UAE) are set per vehicle in the
  admin form. Edit the list in `src/locations.js`.
- Counts are published vehicles only, from `GET /api/browse`. Tiles link to
  `/our-stock?manufacturer=<id>`, `?type=<id>` and `?location=<name>`.

## Run locally

```bash
cp .env.example .env          # fill in DATABASE_URL (+ Firebase later)
npm install
npm start                     # http://localhost:3000  (auto-creates schema + sample data)
```

## Deploy on Railway

1. **New Project → Deploy from GitHub repo**, pick this repo.
2. Service **Settings → Build → Root Directory** = `directauto-app`. Railway (Nixpacks)
   auto-detects Node and runs `node server.js`.
3. **New → Database → Add PostgreSQL** in the same project.
4. On the app service → **Variables**, add a reference variable:
   `DATABASE_URL = ${{Postgres.DATABASE_URL}}`
   The app creates the tables and loads sample cars automatically on first boot.
5. Open the generated domain — the site is live. (The API health check is `/api/health`.)

### Turn on accounts + image upload (Firebase)

1. Create a Firebase project → enable **Authentication → Email/Password** and **Storage**.
2. **Project settings → Service accounts → Generate new private key.** Paste the whole JSON
   (single line) into the `FIREBASE_SERVICE_ACCOUNT` variable, and set `FIREBASE_STORAGE_BUCKET`
   to `your-project-id.appspot.com`.
3. **Project settings → General → Your apps (Web)** — copy the web config into the
   `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_MESSAGING_SENDER_ID`,
   `FIREBASE_APP_ID` variables. (See `.env.example`.)
4. Set `ADMIN_EMAILS` to the email(s) that should become admins on first login.
5. Redeploy. Login/Register and the account area now work; admin-only APIs unlock for admins.

## Notes

- Sample data is only loaded when the `vehicle` table is empty. Delete rows / drop tables to reseed.
- Vehicle images in sample data point at demo pictures in `/assets/images`. Real cars added via the
  admin panel will use Firebase Storage URLs.
