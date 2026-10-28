// Site settings that staff can change from Admin without a developer. Stored one row per key in the
// `settings` table; a key with no row falls back to the default (server env vars / built-in text).
const db = require('../db/pool');

const THEMES = ['forest', 'ocean', 'crimson', 'royal', 'sunset', 'slate', 'custom'];
const SEASONS = ['christmas', 'newyear', 'avurudu', 'vesak', 'easter', 'deepavali'];
const DENSITIES = ['light', 'normal', 'heavy'];
const FONTS = ['inter', 'poppins', 'nunito', 'playfair', 'montserrat'];   // anything else = the built-in font
// Lists staff can edit as a whole (add / remove / reorder). `req` fields must not be empty or the row is dropped.
const LISTS = {
  buySteps: { max: 8, f: { t: 100, d: 60, body: 700 }, req: ['t'] },
  aboutValues: { max: 8, f: { title: 100, text: 400 }, req: ['title'] },
  locationsList: { max: 6, f: { name: 80, text: 120 }, req: ['name'] },
  glossaryItems: { max: 80, f: { term: 100, cat: 40, def: 800, example: 400 }, req: ['term', 'def'] },
  auctionPoints: { max: 6, f: { title: 60, text: 200 }, req: ['title'] },
};
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;
const HEX_RE = /^#[0-9a-f]{6}$/i;

// type: s = text (max length), u = web link, p = phone digits, c = hex colour, t = theme id, b = on/off, e = one of a list, d = date
const FIELDS = {
  phone: ['s', 40], email: ['s', 120], whatsapp: ['p', 20], address: ['s', 200], hours: ['s', 120],
  instagram: ['u', 300], liveAuctionUrl: ['u', 500], liveAuctionHint: ['s', 300],
  whatsappMessage: ['s', 200], showWhatsapp: ['b'],
  theme: ['t'], brandColor: ['c'], accentColor: ['c'],
  topbarText: ['s', 120], footerText: ['s', 300],
  featuredTitle: ['s', 80], featuredLead: ['s', 200],
  auctionTitle: ['s', 80], auctionLead: ['s', 250],
  reviewsTitle: ['s', 80], ctaTitle: ['s', 100], ctaText: ['s', 250],
  showAbout: ['b'], showFeatured: ['b'], showAuction: ['b'], showReviews: ['b'], showCta: ['b'],
  // Seasons: one festive look at a time (effect, decorations, banner, colours), optionally between two dates.
  fontTheme: ['e', FONTS],
  seoTitle: ['s', 120], seoDescription: ['s', 300],
  depositFaq: ['s', 700], aboutCtaTitle: ['s', 100], aboutCtaText: ['s', 250],
  buySteps: ['j', LISTS.buySteps], aboutValues: ['j', LISTS.aboutValues], locationsList: ['j', LISTS.locationsList],
  glossaryItems: ['j', LISTS.glossaryItems], auctionPoints: ['j', LISTS.auctionPoints],
  season: ['e', SEASONS], seasonStart: ['d'], seasonEnd: ['d'], seasonIntensity: ['e', DENSITIES],
  seasonEffect: ['b'], seasonDecor: ['b'], seasonBanner: ['b'], seasonTheme: ['b'], seasonMessage: ['s', 200],
};

// Returns the cleaned value, null for "clear the override", or undefined when the value is not acceptable.
function clean(key, v) {
  const [type, max] = FIELDS[key];
  if (v === null || v === '' || v === undefined) return null;
  if (type === 'j') {
    if (!Array.isArray(v)) return undefined;
    const rows = v.slice(0, max.max).map((row) => {
      const out = {};
      for (const [k, len] of Object.entries(max.f)) out[k] = String((row && row[k]) == null ? '' : row[k]).trim().slice(0, len);
      return out;
    }).filter((row) => max.req.every((k) => row[k]));
    return rows.length ? rows : null;
  }
  if (type === 'b') return v === true || v === 'true' || v === 1;
  const s = String(v).trim();
  if (!s) return null;
  if (type === 'p') { const d = s.replace(/[^0-9]/g, ''); return d.length >= 7 && d.length <= max ? d : undefined; }
  if (type === 'u') return URL_RE.test(s) && s.length <= max ? s : undefined;
  if (type === 'e') return max.includes(s) ? s : undefined;
  if (type === 'd') return DATE_RE.test(s) && !Number.isNaN(Date.parse(s)) ? s : undefined;
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

module.exports = { FIELDS, THEMES, clean, overrides, save };
