// Auth middleware backed by Firebase Auth.
// The browser signs in with the Firebase client SDK and sends the ID token as
//   Authorization: Bearer <idToken>
// We verify it with the Admin SDK, then upsert a matching row in the `profiles` table
// (keyed by Firebase UID) so relational data (inquiries, etc.) can reference the user.
const { verifyIdToken, isConfigured } = require('./firebase');
const db = require('../db/pool');

// Emails listed here are granted admin on first login (comma-separated env var).
const ADMIN_EMAILS = String(process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function upsertProfile(decoded) {
  const email = (decoded.email || '').toLowerCase();
  const seedAdmin = ADMIN_EMAILS.includes(email);
  const { rows } = await db.query(
    `INSERT INTO profiles (uid, email, name, is_admin)
       VALUES ($1, $2, $3, $4)
     ON CONFLICT (uid) DO UPDATE
       SET email = EXCLUDED.email,
           is_admin = profiles.is_admin OR $4,
           updated_at = now()
     RETURNING *`,
    [decoded.uid, email, decoded.name || '', seedAdmin]
  );
  return rows[0];
}

// Populates req.user when a valid token is present; never blocks the request.
async function attachUser(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !isConfigured()) return next();
  try {
    const decoded = await verifyIdToken(token);
    req.firebaseUser = decoded;
    req.user = await upsertProfile(decoded);
  } catch (err) {
    // Invalid/expired token — treat as anonymous.
    req.authError = err.message;
  }
  next();
}

function requireAuth(req, res, next) {
  if (!isConfigured()) return res.status(503).json({ error: 'Authentication is not configured on the server yet.' });
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (!req.user.is_admin) return res.status(403).json({ error: 'Admin access required.' });
  next();
}

module.exports = { attachUser, requireAuth, requireAdmin };
