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
  // Only a VERIFIED email can be promoted via ADMIN_EMAILS. Firebase lets anyone sign up with any
  // address, so without this check someone could register the admin's email first and become admin.
  // Admin when the email is an owner (ADMIN_EMAILS) or was added in Admin > Admins, and only once verified.
  const verified = decoded.email_verified === true;
  const { rows } = await db.query(
    `INSERT INTO profiles (uid, email, name, is_admin)
       VALUES ($1, $2, $3, ($4 OR ($5 AND EXISTS (SELECT 1 FROM admin_emails a WHERE a.email = $2))))
     ON CONFLICT (uid) DO UPDATE
       SET email = EXCLUDED.email,
           is_admin = profiles.is_admin OR EXCLUDED.is_admin,
           updated_at = now()
     RETURNING *`,
    [decoded.uid, email, decoded.name || '', ADMIN_EMAILS.includes(email) && verified, verified]
  );
  return rows[0];
}

// Populates req.user when a valid token is present; never blocks the request.
async function attachUser(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  if (!isConfigured()) return next();
  try {
    const decoded = await verifyIdToken(token);
    req.firebaseUser = decoded;
    req.user = await upsertProfile(decoded);
  } catch (err) {
    // Invalid/expired token - treat as anonymous.
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

// True when ADMIN_EMAILS names at least one owner, so the first admin can be created.
const adminEmailsConfigured = () => ADMIN_EMAILS.length > 0;

module.exports = { attachUser, requireAuth, requireAdmin, adminEmailsConfigured, ownerEmails: () => ADMIN_EMAILS.slice() };
