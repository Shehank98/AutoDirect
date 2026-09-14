// Admin API (Firebase Auth + is_admin required): manage vehicles, taxonomy, view inquiries,
// and upload car images to Firebase Storage.
const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../../db/pool');
const { requireAdmin } = require('../auth');
const { bucket, isConfigured } = require('../firebase');

const router = express.Router();
router.use(requireAdmin);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const slugify = (s) => String(s || '')
  .toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 200);

// ---------- Dashboard stats ----------
router.get('/stats', async (_req, res, next) => {
  try {
    const q = async (sql) => (await db.query(sql)).rows[0].n;
    res.json({
      vehicles:      await q('SELECT COUNT(*)::int n FROM vehicle'),
      published:     await q('SELECT COUNT(*)::int n FROM vehicle WHERE status = 1'),
      inquiries:     await q('SELECT COUNT(*)::int n FROM inquiries'),
      new_inquiries: await q('SELECT COUNT(*)::int n FROM inquiries WHERE status = 0'),
      live_requests: await q('SELECT COUNT(*)::int n FROM live_inquiries'),
      subscribers:   await q('SELECT COUNT(*)::int n FROM newsletters'),
    });
  } catch (e) { next(e); }
});

// ---------- Image upload -> Firebase Storage ----------
router.post('/upload', upload.array('images', 12), async (req, res, next) => {
  try {
    if (!isConfigured()) return res.status(503).json({ error: 'Firebase Storage is not configured on the server.' });
    if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded.' });
    const b = bucket();
    const urls = [];
    for (const file of req.files) {
      const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
      const token = crypto.randomUUID();
      const objectName = `vehicles/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      const blob = b.file(objectName);
      await blob.save(file.buffer, {
        contentType: file.mimetype,
        metadata: { metadata: { firebaseStorageDownloadTokens: token } },
      });
      urls.push(`https://firebasestorage.googleapis.com/v0/b/${b.name}/o/${encodeURIComponent(objectName)}?alt=media&token=${token}`);
    }
    res.status(201).json({ urls });
  } catch (e) { next(e); }
});

// ---------- Vehicles CRUD ----------
router.get('/vehicles', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT v.*, m.name AS manufacturer_name, mo.name AS model_name, t.name AS type_name
         FROM vehicle v
         LEFT JOIN vehicle_manufacturer m ON m.id = v.vehicle_manufacturer
         LEFT JOIN vehicle_model mo ON mo.id = v.vehicle_model
         LEFT JOIN vehicle_type t ON t.id = v.vehicle_type
        ORDER BY v.created_at DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

const VEHICLE_FIELDS = [
  'vehicle_type', 'vehicle_manufacturer', 'vehicle_model', 'main_color', 'other_color',
  'description', 'year', 'chassi_id', 'conditions', 'seats', 'doors', 'passengers',
  'engine_capacity', 'mileage', 'fuel_type', 'transmission', 'drive_type',
  'auction_grade', 'grade', 'price', 'images', 'feature_ids', 'is_featured', 'is_latest', 'status',
];

function buildVehiclePayload(body) {
  const v = {};
  for (const f of VEHICLE_FIELDS) if (body[f] !== undefined) v[f] = body[f];
  // JSON columns
  if (v.images !== undefined) v.images = JSON.stringify(Array.isArray(v.images) ? v.images : []);
  if (v.feature_ids !== undefined) v.feature_ids = JSON.stringify(Array.isArray(v.feature_ids) ? v.feature_ids.map(Number) : []);
  return v;
}

router.post('/vehicles', async (req, res, next) => {
  try {
    const v = buildVehiclePayload(req.body);
    let seo = slugify(req.body.seo_url || `${req.body.manufacturer_name || ''}-${req.body.model_name || ''}-${req.body.year || ''}-${Date.now().toString(36)}`);
    if (!seo) seo = `vehicle-${Date.now().toString(36)}`;
    v.seo_url = seo;

    const cols = Object.keys(v);
    const params = Object.values(v);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const { rows } = await db.query(
      `INSERT INTO vehicle (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, params
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

router.put('/vehicles/:id', async (req, res, next) => {
  try {
    const v = buildVehiclePayload(req.body);
    if (req.body.seo_url) v.seo_url = slugify(req.body.seo_url);
    v.updated_at = new Date().toISOString();
    const cols = Object.keys(v);
    if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
    const params = Object.values(v);
    const set = cols.map((c, i) => `${c} = $${i + 1}`);
    params.push(parseInt(req.params.id, 10));
    const { rows } = await db.query(
      `UPDATE vehicle SET ${set.join(', ')} WHERE id = $${params.length} RETURNING *`, params
    );
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/vehicles/:id', async (req, res, next) => {
  try {
    const { rowCount } = await db.query('DELETE FROM vehicle WHERE id = $1', [parseInt(req.params.id, 10)]);
    if (!rowCount) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Inquiries (read + mark handled) ----------
router.get('/inquiries', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT i.*, m.name AS manufacturer_name, mo.name AS model_name, v.seo_url
         FROM inquiries i
         LEFT JOIN vehicle v ON v.id = i.vehicle_id
         LEFT JOIN vehicle_manufacturer m ON m.id = v.vehicle_manufacturer
         LEFT JOIN vehicle_model mo ON mo.id = v.vehicle_model
        ORDER BY i.created_at DESC`
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.put('/inquiries/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'UPDATE inquiries SET status = $2 WHERE id = $1 RETURNING *',
      [parseInt(req.params.id, 10), parseInt(req.body.status, 10) || 0]
    );
    res.json(rows[0] || {});
  } catch (e) { next(e); }
});

router.get('/live-inquiries', async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM live_inquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { next(e); }
});

// ---------- Taxonomy management (create) ----------
const taxTables = {
  types: { table: 'vehicle_type', cols: ['name', 'image'] },
  manufacturers: { table: 'vehicle_manufacturer', cols: ['name', 'image', 'is_featured'] },
  models: { table: 'vehicle_model', cols: ['name', 'manufacturer_id'] },
  colors: { table: 'vehicle_color', cols: ['name', 'code'] },
  features: { table: 'vehicle_feature', cols: ['name', 'image'] },
};

router.post('/taxonomy/:kind', async (req, res, next) => {
  try {
    const def = taxTables[req.params.kind];
    if (!def) return res.status(404).json({ error: 'Unknown taxonomy.' });
    const cols = def.cols.filter((c) => req.body[c] !== undefined);
    if (!cols.includes('name')) return res.status(400).json({ error: 'Name is required.' });
    const params = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const { rows } = await db.query(
      `INSERT INTO ${def.table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, params
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/taxonomy/:kind/:id', async (req, res, next) => {
  try {
    const def = taxTables[req.params.kind];
    if (!def) return res.status(404).json({ error: 'Unknown taxonomy.' });
    await db.query(`DELETE FROM ${def.table} WHERE id = $1`, [parseInt(req.params.id, 10)]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
