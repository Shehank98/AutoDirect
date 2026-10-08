// Public vehicle browsing API: list (with filters), featured, latest, and detail-by-seo-url.
const express = require('express');
const db = require('../../db/pool');
const router = express.Router();

// A single reusable SELECT that joins taxonomy names and rolls up feature names,
// so the frontend gets ready-to-render objects.
const VEHICLE_SELECT = `
  SELECT v.*,
         t.name  AS type_name,
         m.name  AS manufacturer_name,
         mo.name AS model_name,
         c.name  AS color_name,
         c.code  AS color_code,
         COALESCE(
           (SELECT json_agg(f.name ORDER BY f.name)
              FROM vehicle_feature f
             WHERE f.id = ANY (SELECT jsonb_array_elements_text(v.feature_ids)::int)),
           '[]'
         ) AS feature_names
    FROM vehicle v
    LEFT JOIN vehicle_type         t  ON t.id  = v.vehicle_type
    LEFT JOIN vehicle_manufacturer m  ON m.id  = v.vehicle_manufacturer
    LEFT JOIN vehicle_model        mo ON mo.id = v.vehicle_model
    LEFT JOIN vehicle_color        c  ON c.id  = v.main_color
`;

// GET /api/vehicles  — filterable, paginated listing.
router.get('/', async (req, res, next) => {
  try {
    const q = req.query;
    const where = ['v.status = 1'];
    const params = [];
    const add = (clause, value) => { params.push(value); where.push(clause.replace('$?', `$${params.length}`)); };

    if (q.manufacturer) add('v.vehicle_manufacturer = $?', parseInt(q.manufacturer, 10));
    if (q.model)        add('v.vehicle_model = $?', parseInt(q.model, 10));
    if (q.type)         add('v.vehicle_type = $?', parseInt(q.type, 10));
    if (q.color)        add('v.main_color = $?', parseInt(q.color, 10));
    if (q.location)     add('v.location = $?', q.location);
    if (q.fuel_type)    add('v.fuel_type = $?', q.fuel_type);
    if (q.transmission) add('v.transmission = $?', q.transmission);
    if (q.drive_type)   add('v.drive_type = $?', q.drive_type);
    if (q.grade)        add('v.grade = $?', q.grade);
    if (q.from_year)    add('NULLIF(v.year, \'\')::int >= $?', parseInt(q.from_year, 10));
    if (q.to_year)      add('NULLIF(v.year, \'\')::int <= $?', parseInt(q.to_year, 10));
    if (q.min_price)    add('v.price >= $?', parseFloat(q.min_price));
    if (q.max_price)    add('v.price <= $?', parseFloat(q.max_price));
    if (q.featured === 'true') where.push('v.is_featured = true');
    if (q.latest === 'true')   where.push('v.is_latest = true');
    if (q.search) {
      params.push(`%${q.search}%`);
      const p = `$${params.length}`;
      where.push(`(m.name ILIKE ${p} OR mo.name ILIKE ${p} OR v.description ILIKE ${p} OR v.seo_url ILIKE ${p})`);
    }

    // Sorting
    const sorts = {
      newest: 'v.created_at DESC',
      oldest: 'v.created_at ASC',
      price_low: 'v.price ASC NULLS LAST',
      price_high: 'v.price DESC NULLS LAST',
      year_new: "NULLIF(v.year,'')::int DESC NULLS LAST",
    };
    const orderBy = sorts[q.sort] || 'v.is_featured DESC, v.created_at DESC';

    // Pagination
    const page = Math.max(1, parseInt(q.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(q.limit, 10) || 12));
    const offset = (page - 1) * limit;

    const whereSql = where.join(' AND ');
    const countRes = await db.query(`SELECT COUNT(*)::int AS n FROM vehicle v
      LEFT JOIN vehicle_manufacturer m ON m.id = v.vehicle_manufacturer
      LEFT JOIN vehicle_model mo ON mo.id = v.vehicle_model
      WHERE ${whereSql}`, params);

    const listParams = params.slice();
    listParams.push(limit); const limitP = `$${listParams.length}`;
    listParams.push(offset); const offsetP = `$${listParams.length}`;
    const { rows } = await db.query(
      `${VEHICLE_SELECT} WHERE ${whereSql} ORDER BY ${orderBy} LIMIT ${limitP} OFFSET ${offsetP}`,
      listParams
    );

    const total = countRes.rows[0].n;
    res.json({ data: rows, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

// GET /api/vehicles/featured
router.get('/featured', async (_req, res, next) => {
  try {
    const { rows } = await db.query(`${VEHICLE_SELECT} WHERE v.status = 1 AND v.is_featured = true ORDER BY v.created_at DESC LIMIT 12`);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/vehicles/latest
router.get('/latest', async (_req, res, next) => {
  try {
    const { rows } = await db.query(`${VEHICLE_SELECT} WHERE v.status = 1 AND v.is_latest = true ORDER BY v.created_at DESC LIMIT 12`);
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/vehicles/:seo  — full detail by SEO url (or numeric id).
router.get('/:seo', async (req, res, next) => {
  try {
    const seo = req.params.seo;
    const byId = /^\d+$/.test(seo);
    const { rows } = await db.query(
      `${VEHICLE_SELECT} WHERE v.status = 1 AND ${byId ? 'v.id = $1' : 'v.seo_url = $1'} LIMIT 1`,
      [byId ? parseInt(seo, 10) : seo]
    );
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found' });

    const vehicle = rows[0];
    // A few similar vehicles (same manufacturer) for the detail page.
    const similar = await db.query(
      `${VEHICLE_SELECT} WHERE v.status = 1 AND v.id <> $1 AND v.vehicle_manufacturer = $2
       ORDER BY v.created_at DESC LIMIT 4`,
      [vehicle.id, vehicle.vehicle_manufacturer]
    );
    res.json({ vehicle, similar: similar.rows });
  } catch (e) { next(e); }
});

module.exports = router;
