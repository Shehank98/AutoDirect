// Site settings that staff can change from Admin without a developer. Stored one row per key in the
// `settings` table; a key with no row falls back to the default (server env vars / built-in text).
const db = require('../db/pool');

const THEMES = ['forest', 'ocean', 'crimson', 'royal', 'sunset', 'slate', 'custom'];
const URL_RE = /^https?:\/\/[^\s]+$/i;
const HEX_RE = /^#[0-9a-f]{6}$/i;

// type: s = text (max length), u = web link, p = phone digits, c = hex colour, t = theme id, b = on/off
const FIELDS = {
  phone: ['s', 40], email: ['s', 120], whatsapp: ['p', 20], address: ['s', 200], hours: ['s', 120],
  instagram: ['u', 300], liveAuctionUrl: ['u', 500], liveAuctionHint: ['s', 300],
  whatsappMessage: ['s', 200], showWhatsapp: ['b'],
  theme: ['t'], brandColor: ['c'], accentColor: ['c'],
  topbarText: ['s', 120], footerText: ['s', 300],
  featuredTitle: ['s', 80], featuredLead: ['s', 200],
  auctionTitle: ['s', 80], auctionLead: ['s', 250],
  reviewsTitle: ['s', 80], ctaTitle: ['s', 100], ctaText: ['s', 250],
  showFeatured: ['b'], showAuction: ['b'], showReviews: ['b'], showCta: ['b'],
};

// Returns the cleaned value, null for "clear the override", or undefined when the value is not acceptable.
function clean(key, v) {
  const [type, max] = FIELDS[key];
  if (v === null || v === '' || v === undefined) return null;
  if (type === 'b') return v === true || v === 'true' || v === 1;
  const s = String(v).trim();
  if (!s) return null;
  if (type === 'p') { const d = s.replace(/[^0-9]/g, ''); return d.length >= 7 && d.length <= max ? d : undefined; }
  if (type === 'u') return URL_RE.test(s) && s.length <= max ? s : undefined;
  if (type === 'c') return HEX_RE.test(s) ? s.toLowerCase() : undefined;
  if (type === 't') return THEMES.includes(s) ? s : undefined;
  return s.slice(0, max);
}

async function overrides() {
  try {
    const { rows } = await db.query('SELECT key, value FROM settings');
    const out = {};
    for (const r of rows) if (FIELDS[r.key]) out[r.key] = r.value;
    return out;
  } catch (_e) { return {}; }   // table not created yet
}

async function save(body) {
  const bad = [];
  for (const key of Object.keys(body || {})) {
    if (!FIELDS[key]) continue;
    const v = clean(key, body[key]);
    if (v === undefined) { bad.push(key); continue; }
    if (v === null) await db.query('DELETE FROM settings WHERE key = $1', [key]);
    else await db.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`, [key, JSON.stringify(v)]);
  }
  return bad;
}

module.exports = { FIELDS, THEMES, overrides, save };
