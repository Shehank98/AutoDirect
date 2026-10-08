// One request that gives the storefront everything it renders: published vehicles, brand / body-type /
// location lists (with live counts for the "Browse by" section), features, and this week's auction lots.
const express = require('express');
const db = require('../../db/pool');
const locations = require('../locations');
const { VEHICLE_SELECT, toVehicle, toLot } = require('../vehicleQuery');
const router = express.Router();

// Public contact details (shown in the header, footer and contact page). Override with env vars.
const site = () => ({
  phone: process.env.SITE_PHONE || '+94 768 65 65 15',
  email: process.env.SITE_EMAIL || 'info@directautoimport.lk',
  whatsapp: (process.env.SITE_WHATSAPP || process.env.SITE_PHONE || '+94 768 65 65 15').replace(/[^0-9]/g, ''),
  address: process.env.SITE_ADDRESS || 'Malabe showroom · Colombo 07 office',
  hours: process.env.SITE_HOURS || 'Mon–Sat · 9.00–6.00',
  instagram: process.env.SITE_INSTAGRAM || 'https://www.instagram.com/directautoimport.lk/',
  jpyLkr: Number(process.env.JPY_LKR) || 2.05, // rough yen -> rupee rate for the "≈ LKR FOB" hint on auction lots
});

router.get('/catalog', async (_req, res, next) => {
  try {
    const [veh, brands, models, types, feats, lots] = await Promise.all([
      db.query(`${VEHICLE_SELECT} WHERE v.status = 1 ORDER BY v.created_at DESC`),
      db.query('SELECT id, name, image FROM vehicle_manufacturer WHERE status = 1 ORDER BY name'),
      db.query('SELECT name, manufacturer_id FROM vehicle_model WHERE status = 1 ORDER BY name'),
      db.query('SELECT id, name, image FROM vehicle_type WHERE status = 1 ORDER BY name'),
      db.query('SELECT name FROM vehicle_feature WHERE status = 1 ORDER BY name'),
      db.query(`SELECT * FROM auction_lots WHERE status = 1 AND (ends_at IS NULL OR ends_at > now()) ORDER BY ends_at NULLS LAST, id DESC LIMIT 12`),
    ]);
    const vehicles = veh.rows.map(toVehicle);
    const count = (key, val) => vehicles.filter((v) => v[key] === val).length;
    res.json({
      vehicles,
      brands: brands.rows.map((b) => ({
        ...b, count: count('make', b.name),
        models: models.rows.filter((m) => m.manufacturer_id === b.id).map((m) => m.name),
      })),
      types: types.rows.map((t) => ({ ...t, count: count('type', t.name) })),
      features: feats.rows.map((f) => f.name),
      locations: locations.map((l) => ({ ...l, count: count('location', l.name) })),
      lots: lots.rows.map(toLot),
      site: site(),
    });
  } catch (e) { next(e); }
});

module.exports = router;
