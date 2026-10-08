// DirectAuto Import - Express server.
// Serves the static HTML/CSS/JS frontend from /public and the JSON API under /api.
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const migrate = require('./db/migrate');
const { attachUser } = require('./src/auth');
const { isConfigured } = require('./src/firebase');

const app = express();
app.set('trust proxy', 1); // behind Railway's proxy (correct protocol/IP)

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(attachUser); // populates req.user when a valid Firebase token is sent

// ---------------- API ----------------
const api = express.Router();
api.get('/health', (_req, res) => res.json({ ok: true, firebase: isConfigured() }));
api.get('/config', (_req, res) => res.json({
  // Public Firebase web config for the browser SDK (safe to expose).
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
  },
  authEnabled: isConfigured(),
}));

api.use('/', require('./src/routes/taxonomy'));
api.use('/', require('./src/routes/catalog'));
api.use('/', require('./src/routes/lots'));
api.use('/vehicles', require('./src/routes/vehicles'));
api.use('/', require('./src/routes/inquiries'));
api.use('/account', require('./src/routes/account'));
api.use('/admin', require('./src/routes/admin'));

app.use('/api', api);

// ---------------- Static frontend ----------------
// The storefront and admin are one single-page app (public/index.html + public/app/*).
// Real files (assets, JS, images) are served as-is; every other GET path is a client-side
// route (/our-stock/<seo-url>, /my-account, /admin ...) and gets the app shell.
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR, { index: false }));

// 404 for unknown API routes.
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// SPA fallback (must come after the API 404 above so unknown /api paths stay JSON).
app.get('*', (req, res, next) => {
  if (path.extname(req.path)) return next(); // a missing file is a real 404
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Central error handler.
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Server error', detail: process.env.NODE_ENV === 'production' ? undefined : err.message });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    if (process.env.DATABASE_URL) {
      await migrate();
    } else {
      console.warn('[start] DATABASE_URL not set - skipping migrate. The API will error until Postgres is connected.');
    }
  } catch (err) {
    console.error('[start] migration failed (continuing to boot):', err.message);
  }
  app.listen(PORT, () => console.log(`DirectAuto listening on :${PORT}`));
}

start();
