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

router.get('/locations', (_req, res) => res.json(locations));

module.exports = router;
