// Admin sign-in from environment variables (no Firebase needed).
//   ADMIN_USERNAME / ADMIN_PASSWORD   set in Railway; the password must be at least 8 characters.
//   ADMIN_SESSION_SECRET              optional; signs session tokens (defaults to a hash of the credentials,
//                                     so changing the password signs everyone out).
// A successful login returns a signed, expiring token. The browser sends it as
//   Authorization: Bearer adm.<payload>.<signature>
// (a header, not a cookie, so it can't be replayed by another site).
const crypto = require('crypto');

const TTL_MS = 12 * 60 * 60 * 1000;
const MAX_FAILS = 8;
const WINDOW_MS = 15 * 60 * 1000;

const username = () => process.env.ADMIN_USERNAME || '';
const password = () => process.env.ADMIN_PASSWORD || '';
// A blank or obviously placeholder password never counts as configured.
const PLACEHOLDERS = ['change-me', 'changeme', 'password', '12345678', 'admin123', 'change-me-to-a-long-random-password'];
const configured = () => username().length > 0 && password().length >= 8 && !PLACEHOLDERS.includes(password().toLowerCase());

const secret = () => process.env.ADMIN_SESSION_SECRET ||
  crypto.createHash('sha256').update(`ad-admin-session|${username()}|${password()}`).digest('hex');
const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sig = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

// Constant-time comparison that doesn't leak length.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function issue() {
  const payload = b64(JSON.stringify({ u: username(), exp: Date.now() + TTL_MS }));
  return `adm.${payload}.${sig(payload)}`;
}

// Returns { username } for a valid, unexpired token; otherwise null.
function verify(token) {
  if (!configured() || typeof token !== 'string' || !token.startsWith('adm.')) return null;
  const [, payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sig(payload);
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!p.exp || p.exp < Date.now() || p.u !== username()) return null;
    return { username: p.u };
  } catch (_e) { return null; }
}

// Failed-login throttle per client IP (in memory; resets on restart, which is fine for one instance).
const fails = new Map();
function throttled(ip) {
  const f = fails.get(ip);
  if (!f) return false;
  if (Date.now() - f.first > WINDOW_MS) { fails.delete(ip); return false; }
  return f.n >= MAX_FAILS;
}
function recordFail(ip) {
  const f = fails.get(ip);
  if (!f || Date.now() - f.first > WINDOW_MS) fails.set(ip, { n: 1, first: Date.now() });
  else f.n += 1;
}
setInterval(() => { const now = Date.now(); for (const [ip, f] of fails) if (now - f.first > WINDOW_MS) fails.delete(ip); }, WINDOW_MS).unref();

function login(req, res) {
  if (!configured()) {
    return res.status(503).json({ error: 'Admin sign-in is not set up. Set ADMIN_USERNAME and an ADMIN_PASSWORD of at least 8 characters in the server variables.' });
  }
  const ip = req.ip || 'unknown';
  if (throttled(ip)) return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' });
  const { username: u, password: p } = req.body || {};
  // Evaluate both so timing doesn't reveal which one was wrong.
  const okUser = safeEqual(u || '', username());
  const okPass = safeEqual(p || '', password());
  if (!(okUser && okPass)) {
    recordFail(ip);
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }
  fails.delete(ip);
  res.json({ token: issue(), username: username(), expiresInHours: TTL_MS / 3600000 });
}

module.exports = { configured, verify, login };
