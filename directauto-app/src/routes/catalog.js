// One request that gives the storefront everything it renders: published vehicles, brand / body-type /
// location lists (with live counts for the "Browse by" section), features, and public site settings.
// The result is cached for a minute and cleared whenever the admin changes anything.
const express = require('express');
const db = require('../../db/pool');
const locations = require('../locations');
const fallbackTestimonials = require('../content/testimonials.json');
const { VEHICLE_SELECT, toVehicle } = require('../vehicleQuery');
const settings = require('../settings');
const router = express.Router();

// Public contact details and links (header, footer, Contact page, Live auction). Override with env vars.
const site = () => ({
  phone: process.env.SITE_PHONE || '+94 768 65 65 15',
  email: process.env.SITE_EMAIL || 'info@directautoimport.lk',
  whatsapp: (process.env.SITE_WHATSAPP || process.env.SITE_PHONE || '+94 768 65 65 15').replace(/[^0-9]/g, ''),
  address: process.env.SITE_ADDRESS || 'Malabe showroom · Colombo 07 office',
  hours: process.env.SITE_HOURS || 'Mon-Sat · 9.00-6.00',
  instagram: process.env.SITE_INSTAGRAM || 'https://www.instagram.com/directautoimport.lk/',
  liveAuctionUrl: process.env.LIVE_AUCTION_URL || 'https://jpcenter.ru/on?classic',
  liveAuctionHint: process.env.LIVE_AUCTION_HINT || '',
  // Optional third-party widgets (off unless set). Values are validated again in the browser before loading.
  gaId: process.env.GA_MEASUREMENT_ID || '',                       // Google Analytics 4, e.g. G-XXXXXXXXXX
  tawkId: process.env.TAWK_PROPERTY_ID || '',                      // Tawk.to live chat property id
  tawkWidget: process.env.TAWK_WIDGET_ID || 'default',
});

let cache = null;
const TTL_MS = 60 * 1000;
const invalidate = () => { cache = null; };

async function build() {
  const [veh, brands, models, types, feats, reviews, overrides] = await Promise.all([
    db.query(`${VEHICLE_SELECT} WHERE v.status = 1 ORDER BY v.created_at DESC`),
    db.query('SELECT id, name, image FROM vehicle_manufacturer WHERE status = 1 ORDER BY name'),
    db.query('SELECT name, manufacturer_id FROM vehicle_model WHERE status = 1 ORDER BY name'),
    db.query('SELECT id, name, image FROM vehicle_type WHERE status = 1 ORDER BY name'),
    db.query('SELECT name FROM vehicle_feature WHERE status = 1 ORDER BY name'),
    // If the table is not there yet (migration not run) fall back to the bundled reviews.
    db.query(`SELECT name, role, quote, lang, image, featured FROM testimonials WHERE status = 1 ORDER BY featured DESC, id`).then((r) => r.rows).catch(() => null),
    settings.overrides(),
  ]);
  const vehicles = veh.rows.map(toVehicle);
  const count = (key, val) => vehicles.filter((v) => v[key] === val).length;
  return {
    vehicles,
    brands: brands.rows.map((b) => ({
      ...b, count: count('make', b.name),
      models: models.rows.filter((m) => m.manufacturer_id === b.id).map((m) => m.name),
    })),
    types: types.rows.map((t) => ({ ...t, count: count('type', t.name) })),
    features: feats.rows.map((f) => f.name),
    locations: locations.map((l) => ({ ...l, count: count('location', l.name) })),
    testimonials: reviews || fallbackTestimonials,
    overrides,
  };
}

// The cached catalogue (also used by the sitemap and the per-page SEO tags).
async function getCatalog() {
  if (!cache || Date.now() - cache.at > TTL_MS) cache = { at: Date.now(), body: await build() };
  return cache.body;
}

router.get('/catalog', async (_req, res, next) => {
  try {
    const { overrides, ...rest } = await getCatalog();
    res.json({ ...rest, site: { ...site(), ...overrides } });
  } catch (e) { next(e); }
});

module.exports = router;
module.exports.invalidate = invalidate;
module.exports.getCatalog = getCatalog;
module.exports.siteDefaults = site;
