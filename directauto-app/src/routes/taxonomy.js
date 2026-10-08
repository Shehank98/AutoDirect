// Reference data used to build the search filters and dropdowns.
const express = require('express');
const db = require('../../db/pool');
const locations = require('../locations');
const router = express.Router();

const active = 'status = 1';

router.get('/types', async (_req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT id, name, image FROM vehicle_type WHERE ${active} ORDER BY name`);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/manufacturers', async (req, res, next) => {
  try {
    const onlyFeatured = String(req.query.featured) === 'true';
    const { rows } = await db.query(
      `SELECT id, name, image, is_featured FROM vehicle_manufacturer
        WHERE ${active} ${onlyFeatured ? 'AND is_featured = true' : ''}
        ORDER BY name`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/models', async (req, res, next) => {
  try {
    const manufacturerId = parseInt(req.query.manufacturer, 10);
    const params = [];
    let where = active;
    if (Number.isInteger(manufacturerId)) {
      params.push(manufacturerId);
      where += ` AND manufacturer_id = $${params.length}`;
    }
    const { rows } = await db.query(
      `SELECT id, name, manufacturer_id FROM vehicle_model WHERE ${where} ORDER BY name`, params
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/colors', async (_req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT id, name, code FROM vehicle_color WHERE ${active} ORDER BY name`);
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/features', async (_req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT id, name, image FROM vehicle_feature WHERE ${active} ORDER BY name`);
    res.json(rows);
  } catch (e) { next(e); }
});

// Everything the home page "Browse by..." section needs, with published-vehicle counts.
router.get('/browse', async (_req, res, next) => {
  try {
    const [brands, types, locs] = await Promise.all([
      db.query(`SELECT m.id, m.name, m.image, COUNT(v.id)::int AS count
                  FROM vehicle_manufacturer m
                  LEFT JOIN vehicle v ON v.vehicle_manufacturer = m.id AND v.status = 1
                 WHERE m.${active} GROUP BY m.id ORDER BY count DESC, m.name`),
      db.query(`SELECT t.id, t.name, t.image, COUNT(v.id)::int AS count
                  FROM vehicle_type t
                  LEFT JOIN vehicle v ON v.vehicle_type = t.id AND v.status = 1
                 WHERE t.${active} GROUP BY t.id ORDER BY count DESC, t.name`),
      db.query(`SELECT location AS name, COUNT(*)::int AS count FROM vehicle
                 WHERE status = 1 AND location <> '' GROUP BY location`),
    ]);
    const byLoc = Object.fromEntries(locs.rows.map((r) => [r.name, r.count]));
    res.json({
      brands: brands.rows,
      types: types.rows,
      locations: locations.map((l) => ({ ...l, count: byLoc[l.name] || 0 })),
    });
  } catch (e) { next(e); }
});

router.get('/locations', (_req, res) => res.json(locations));

module.exports = router;
