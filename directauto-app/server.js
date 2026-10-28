// Direct Auto - Express server.
// Serves the single-page frontend from /public and the JSON API under /api.
require('dotenv').config();
const path = require('path');
const express = require('express');

const migrate = require('./db/migrate');
const db = require('./db/pool');
const { attachUser, adminEmailsConfigured } = require('./src/auth');
const { isConfigured } = require('./src/firebase');
const rateLimit = require('./src/rateLimit');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // behind Railway's proxy (correct protocol / client IP)

// Basic hardening headers. No CSP on purpose: the Live auction page embeds a third-party site.
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',          // our pages can't be framed by other sites
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  next();
});

// The site and API share one origin, so CORS is off unless you explicitly allow an origin.
if (process.env.CORS_ORIGIN) app.use(require('cors')({ origin: process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) }));

app.use(express.json({ limit: '100kb' }));
app.use(attachUser); // populates req.user (Firebase Auth) when a valid token is sent

// ---------------- API ----------------
const api = express.Router();
api.get('/health', (_req, res) => res.json({ ok: true }));
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
  authEnabled: isConfigured(),               // customer accounts (Firebase)
  adminEmails: adminEmailsConfigured(),      // ADMIN_EMAILS is set, so a verified owner email can become admin
}));

const formLimit = rateLimit({ windowMs: 10 * 60 * 1000, max: 15, message: 'Too many submissions. Please try again in a few minutes.' });
api.post(['/inquiries', '/newsletter', '/live-inquiries'], formLimit);

api.use('/', require('./src/routes/taxonomy'));
api.use('/', require('./src/routes/catalog'));
api.use('/vehicles', require('./src/routes/vehicles'));
api.use('/', require('./src/routes/inquiries'));
api.use('/account', require('./src/routes/account'));
api.use('/admin', require('./src/routes/admin'));

// Unknown API paths stay JSON (never fall through to the app shell).
api.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use('/api', api);

// ---------------- Static frontend ----------------
// The storefront and admin are one single-page app (public/index.html + public/app/*).
// Real files (assets, JS, images) are served as-is; every other GET path is a client-side route
// (/our-stock/<seo-url>, /my-account, /admin ...) and gets the app shell.
const PUBLIC_DIR = path.join(__dirname, 'public');
const seo = require('./src/seo');
const { getCatalog } = require('./src/routes/catalog');
app.get('/robots.txt', (req, res) => res.type('text/plain').send(seo.robots(req)));
app.get('/sitemap.xml', async (req, res, next) => {
  try { res.type('application/xml').send(seo.sitemap(req, await getCatalog().catch(() => null))); } catch (e) { next(e); }
});
app.use(express.static(PUBLIC_DIR, { index: false }));
app.get('*', async (req, res, next) => {
  if (path.extname(req.path)) return next(); // a missing file is a real 404
  // The app shell, with this page's title / description / link-preview tags filled in for crawlers.
  const catalog = process.env.DATABASE_URL ? await getCatalog().catch(() => null) : null;
  const { html, status } = seo.render(req, catalog);
  res.status(status).type('html').send(html);
});

const PG_CLIENT_ERRORS = {
  '22P02': { status: 400, message: 'Some of the values you sent are not valid.' },   // invalid text representation
  '22003': { status: 400, message: 'A number you sent is out of range.' },
  '22007': { status: 400, message: 'That date is not valid.' },
  '22008': { status: 400, message: 'That date is not valid.' },
  '22001': { status: 400, message: 'A value you sent is too long.' },
  '23502': { status: 400, message: 'A required value is missing.' },
  '23503': { status: 400, message: 'That refers to something that does not exist.' },
  '23514': { status: 400, message: 'Some of the values you sent are not valid.' },
  '23505': { status: 409, message: 'That already exists.' },
};

// Central error handler.
app.use((err, req, res, _next) => {
  // Bad JSON bodies and oversized payloads are the client's fault.
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
    return res.status(err.status || 400).json({ error: err.type === 'entity.too.large' ? 'That request is too large.' : 'Invalid JSON.' });
  }
  // Postgres rejected a value the client sent (letters where a number belongs, id out of range, bad date,
  // text too long, unknown foreign key...). That is a bad request, not a server fault.
  // Any Postgres "data exception" (SQLSTATE class 22, e.g. a NUL byte in text) is also the client's input.
  const pg = err && (PG_CLIENT_ERRORS[err.code] || (/^22/.test(String(err.code)) ? PG_CLIENT_ERRORS['22P02'] : null));
  if (pg) return res.status(pg.status).json({ error: pg.message });
  // Malformed URLs (e.g. /our-stock/%E0%A4%A) and other framework-level 4xx errors.
  if (err instanceof URIError || (err && err.status >= 400 && err.status < 500)) return res.status(err.status || 400).json({ error: 'Bad request.' });
  if (err && err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'Image is too large (8 MB max).' });
  console.error('[error]', req.method, req.originalUrl, err);
  res.status(500).json({ error: 'Server error', detail: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

const PORT = process.env.PORT || 3000;

async function start() {
  if (!adminEmailsConfigured()) console.warn('[admin] ADMIN_EMAILS is not set: nobody can become the first admin. Set it to the owner email(s) in the service Variables.');
  try {
    if (process.env.DATABASE_URL) await migrate();
    else console.warn('[start] DATABASE_URL not set - skipping migrate. The API will error until Postgres is connected.');
  } catch (err) {
    console.error('[start] migration failed (continuing to boot):', err.message);
  }
  const server = app.listen(PORT, () => console.log(`Direct Auto listening on :${PORT}`));

  // Railway stops containers with SIGTERM: finish in-flight requests, then close the DB pool.
  const stop = () => {
    server.close(() => db.pool.end().finally(() => process.exit(0)));
    setTimeout(() => process.exit(0), 8000).unref();
  };
  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
}

start();
