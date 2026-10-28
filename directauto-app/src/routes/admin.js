// Admin API (Firebase Auth + is_admin required): manage vehicles, taxonomy, view inquiries,
// and upload car images to Firebase Storage.
const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../../db/pool');
const { requireAdmin } = require('../auth');
const { bucket, isConfigured } = require('../firebase');
const samples = require('../samples');
const { invalidate, siteDefaults } = require('./catalog');
const settings = require('../settings');
const mailer = require('../mailer');

const router = express.Router();
router.use(requireAdmin);
// Any change made in the admin must show up on the public site right away.
router.use((req, res, next) => { if (req.method !== 'GET') res.on('finish', invalidate); next(); });

// Who is signed in, and which optional features are available right now.
router.get('/me', (req, res) => res.json({
  username: req.user.email,
  uploads: isConfigured(),               // Firebase Storage available for photo upload
  sampleImages: samples.enabled(),       // listings show the bundled sample photos
  email: { enabled: mailer.enabled() },   // Google Apps Script mail service connected (alerts to staff, updates to customers)
}));

// Sends a test email through the Google Apps Script so the connection can be checked from the admin.
router.post('/email-test', async (req, res) => {
  const r = await mailer.send('test', { by: req.user && req.user.email });
  res.status(r.ok ? 200 : 502).json(r.ok ? { ok: true, to: r.to || [] } : { error: r.error });
});

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
      in_stock:      await q("SELECT COUNT(*)::int n FROM vehicle WHERE status = 1 AND stock_status = 'Available'"),
      in_transit:    await q("SELECT COUNT(*)::int n FROM vehicle WHERE status = 1 AND stock_status = 'In transit'"),
      open_requests: await q('SELECT COUNT(*)::int n FROM live_inquiries WHERE stage = 0'),
      customers:     await q('SELECT COUNT(*)::int n FROM profiles'),
      subscribers:   await q('SELECT COUNT(*)::int n FROM newsletters'),
    });
  } catch (e) { next(e); }
});

// ---------- Image upload -> Firebase Storage ----------
const FOLDERS = ['vehicles', 'brands', 'types', 'testimonials'];

router.post('/upload', upload.array('images', 12), async (req, res, next) => {
  try {
    if (!isConfigured()) return res.status(503).json({ error: 'Firebase Storage is not configured on the server.' });
    if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded.' });
    if (req.files.some((f) => !/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(f.mimetype))) {
      return res.status(400).json({ error: 'Only image files (JPG, PNG, WebP, GIF, SVG) are allowed.' });
    }
    const folder = FOLDERS.includes(req.query.folder) ? req.query.folder : 'vehicles';
    const b = bucket();
    const urls = [];
    for (const file of req.files) {
      const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
      const token = crypto.randomUUID();
      const objectName = `${folder}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
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

// Best-effort removal of Firebase Storage files that are no longer referenced.
// Only touches URLs that point at our own bucket; local demo images are ignored.
async function deleteStoredImages(urls) {
  if (!isConfigured()) return;
  const b = bucket();
  for (const u of urls || []) {
    try {
      const m = String(u).match(/^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)/);
      if (m && m[1] === b.name) await b.file(decodeURIComponent(m[2])).delete({ ignoreNotFound: true });
    } catch (err) { console.warn('[admin] could not delete stored image:', err.message); }
  }
}

// ---------- Vehicles CRUD ----------
router.get('/vehicles', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT v.*, m.name AS manufacturer_name, mo.name AS model_name, t.name AS type_name, c.name AS color_name
         FROM vehicle v
         LEFT JOIN vehicle_manufacturer m ON m.id = v.vehicle_manufacturer
         LEFT JOIN vehicle_model mo ON mo.id = v.vehicle_model
         LEFT JOIN vehicle_type t ON t.id = v.vehicle_type
         LEFT JOIN vehicle_color c ON c.id = v.main_color
        ORDER BY v.created_at DESC`
    );
    // `thumb` is what the storefront will actually show for this car (sample photo or first stored photo).
    res.json(rows.map((v) => ({ ...v, thumb: samples.enabled() ? samples.sampleImages(v)[0] : (v.images || [])[0] || null })));
  } catch (e) { next(e); }
});

const VEHICLE_FIELDS = [
  'vehicle_type', 'vehicle_manufacturer', 'vehicle_model', 'main_color', 'other_color',
  'description', 'year', 'chassi_id', 'conditions', 'seats', 'doors', 'passengers',
  'engine_capacity', 'mileage', 'fuel_type', 'transmission', 'drive_type',
  'auction_grade', 'grade', 'price', 'location', 'trim', 'stock_status', 'badge', 'images', 'feature_ids', 'is_featured', 'is_latest', 'status',
];

const INT_FIELDS = ['vehicle_type', 'vehicle_manufacturer', 'vehicle_model', 'main_color', 'seats', 'doors', 'passengers', 'status'];
const BOOL_FIELDS = ['is_featured', 'is_latest'];

function buildVehiclePayload(body) {
  const v = {};
  for (const f of VEHICLE_FIELDS) if (body[f] !== undefined) v[f] = body[f];
  // Blank form inputs arrive as '' - store them as NULL in numeric columns.
  for (const f of INT_FIELDS) if (f in v) v[f] = v[f] === '' || v[f] === null ? null : parseInt(v[f], 10);
  if ('price' in v) v.price = v.price === '' || v.price === null ? null : parseFloat(v.price);
  for (const f of BOOL_FIELDS) if (f in v) v[f] = v[f] === true || v[f] === 'true' || v[f] === 1;
  if ('badge' in v) v.badge = String(v.badge == null ? '' : v.badge).trim().slice(0, 40);
  if ('status' in v && v.status === null) v.status = 1;
  // JSON columns
  if (v.images !== undefined) v.images = JSON.stringify(Array.isArray(v.images) ? v.images : []);
  if (v.feature_ids !== undefined) v.feature_ids = JSON.stringify(Array.isArray(v.feature_ids) ? v.feature_ids.map(Number) : []);
  return v;
}

// "Toyota Aqua 2018" -> "toyota-aqua-2018-<token>" (looked up from the chosen ids).
async function defaultSeo(v) {
  const [m, mo] = await Promise.all([
    v.vehicle_manufacturer ? db.query('SELECT name FROM vehicle_manufacturer WHERE id = $1', [v.vehicle_manufacturer]) : { rows: [] },
    v.vehicle_model ? db.query('SELECT name FROM vehicle_model WHERE id = $1', [v.vehicle_model]) : { rows: [] },
  ]);
  return slugify(`${m.rows[0]?.name || ''}-${mo.rows[0]?.name || ''}-${v.year || ''}`) || 'vehicle';
}

router.post('/vehicles', async (req, res, next) => {
  try {
    const v = buildVehiclePayload(req.body);
    const base = slugify(req.body.seo_url) || await defaultSeo(v);
    v.seo_url = `${base}-${Date.now().toString(36)}`;

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
    const before = v.images !== undefined
      ? (await db.query('SELECT images FROM vehicle WHERE id = $1', [parseInt(req.params.id, 10)])).rows[0]
      : null;
    const cols = Object.keys(v);
    if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
    const params = Object.values(v);
    const set = cols.map((c, i) => `${c} = $${i + 1}`);
    params.push(parseInt(req.params.id, 10));
    const { rows } = await db.query(
      `UPDATE vehicle SET ${set.join(', ')} WHERE id = $${params.length} RETURNING *`, params
    );
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found.' });
    if (before) {
      const kept = new Set(rows[0].images);
      deleteStoredImages((before.images || []).filter((u) => !kept.has(u)));
    }
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/vehicles/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query('DELETE FROM vehicle WHERE id = $1 RETURNING images', [parseInt(req.params.id, 10)]);
    if (!rows.length) return res.status(404).json({ error: 'Vehicle not found.' });
    deleteStoredImages(rows[0].images);
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

// Update tracking info (stage 0..6, customer-visible note, ETA) and the handled flag.
const REF_BASE = { inquiries: ['INQ-', 24000], live_inquiries: ['AR-', 3000] };
function trackingUpdate(table) {
  return async (req, res, next) => {
    try {
      const b = req.body || {};
      const before = (await db.query(`SELECT stage FROM ${table} WHERE id = $1`, [parseInt(req.params.id, 10)])).rows[0];
      const sets = [], params = [];
      const add = (col, val) => { params.push(val); sets.push(`${col} = $${params.length}`); };
      if (b.status !== undefined) add('status', parseInt(b.status, 10) ? 1 : 0);
      if (b.stage !== undefined) add('stage', Math.min(6, Math.max(0, parseInt(b.stage, 10) || 0)));
      if (b.note !== undefined) add('note', String(b.note).slice(0, 500));
      if (b.eta !== undefined) add('eta', b.eta || null);
      if (!sets.length) return res.status(400).json({ error: 'Nothing to update.' });
      params.push(parseInt(req.params.id, 10));
      const { rows } = await db.query(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
      if (!rows.length) return res.status(404).json({ error: 'Not found.' });
      res.json(rows[0]);
      // The customer gets an email when their order moves to a new stage (needs an email address on the request).
      const r = rows[0];
      if (before && r.stage !== before.stage && mailer.validEmail(r.email)) {
        let car = '';
        if (table === 'inquiries') {
          const v = await db.query(`SELECT v.year, v.trim, m.name AS make, mo.name AS model FROM vehicle v
            LEFT JOIN vehicle_manufacturer m ON m.id = v.vehicle_manufacturer LEFT JOIN vehicle_model mo ON mo.id = v.vehicle_model WHERE v.id = $1`, [r.vehicle_id]).catch(() => ({ rows: [] }));
          if (v.rows[0]) car = [v.rows[0].year, v.rows[0].make, v.rows[0].model, v.rows[0].trim].filter(Boolean).join(' ');
        } else car = [r.make, r.model].filter(Boolean).join(' ');
        mailer.send('stage', {
          ref: REF_BASE[table][0] + (REF_BASE[table][1] + r.id), kind: r.kind, name: r.name, email: r.email, car,
          stage: r.stage, stageName: mailer.STAGES[r.stage] || '', note: r.note || '', eta: r.eta ? new Date(r.eta).toISOString().slice(0, 10) : '',
        });
      }
    } catch (e) { next(e); }
  };
}

router.put('/inquiries/:id', trackingUpdate('inquiries'));

router.delete('/inquiries/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM inquiries WHERE id = $1', [parseInt(req.params.id, 10)]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.put('/live-inquiries/:id', trackingUpdate('live_inquiries'));

router.get('/live-inquiries', async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM live_inquiries ORDER BY created_at DESC');
    res.json(rows);
  } catch (e) { next(e); }
});

router.delete('/live-inquiries/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM live_inquiries WHERE id = $1', [parseInt(req.params.id, 10)]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- People ----------
router.get('/customers', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT p.uid, p.name, p.email, p.phone, p.address, p.is_admin, p.created_at,
              (SELECT COUNT(*)::int FROM inquiries i WHERE i.uid = p.uid) + (SELECT COUNT(*)::int FROM live_inquiries l WHERE l.uid = p.uid) AS requests
         FROM profiles p ORDER BY p.created_at DESC`);
    res.json(rows);
  } catch (e) { next(e); }
});

router.put('/customers/:uid', async (req, res, next) => {
  try {
    const makeAdmin = !!(req.body && req.body.is_admin);
    if (!makeAdmin && req.user && req.params.uid === req.user.uid) return res.status(400).json({ error: "You can't remove your own admin access." });
    const { rows } = await db.query('UPDATE profiles SET is_admin = $2, updated_at = now() WHERE uid = $1 RETURNING uid, is_admin', [req.params.uid, makeAdmin]);
    if (!rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/newsletters', async (_req, res, next) => {
  try { res.json((await db.query('SELECT * FROM newsletters ORDER BY created_at DESC')).rows); } catch (e) { next(e); }
});

router.delete('/newsletters/:id', async (req, res, next) => {
  try { await db.query('DELETE FROM newsletters WHERE id = $1', [parseInt(req.params.id, 10)]); res.json({ ok: true }); } catch (e) { next(e); }
});

// ---------- Taxonomy management (list / create / edit / delete) ----------
const taxTables = {
  types: { table: 'vehicle_type', cols: ['name', 'image', 'status'] },
  manufacturers: { table: 'vehicle_manufacturer', cols: ['name', 'image', 'is_featured', 'status'] },
  models: { table: 'vehicle_model', cols: ['name', 'manufacturer_id', 'status'] },
  colors: { table: 'vehicle_color', cols: ['name', 'code', 'status'] },
  features: { table: 'vehicle_feature', cols: ['name', 'image', 'status'] },
};

function taxDef(req, res) {
  const def = taxTables[req.params.kind];
  if (!def) res.status(404).json({ error: 'Unknown taxonomy.' });
  return def;
}

router.get('/taxonomy/:kind', async (req, res, next) => {
  try {
    const def = taxDef(req, res); if (!def) return;
    // Unlike the public API this includes hidden rows, plus how many vehicles use each.
    const usage = {
      types: 'vehicle_type', manufacturers: 'vehicle_manufacturer', models: 'vehicle_model', colors: 'main_color',
    }[req.params.kind];
    const count = usage ? `(SELECT COUNT(*)::int FROM vehicle v WHERE v.${usage} = t.id)` : '0';
    const { rows } = await db.query(`SELECT t.*, ${count} AS vehicle_count FROM ${def.table} t ORDER BY t.name`);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/taxonomy/:kind', async (req, res, next) => {
  try {
    const def = taxDef(req, res); if (!def) return;
    const cols = def.cols.filter((c) => req.body[c] !== undefined);
    if (!cols.includes('name') || !String(req.body.name).trim()) return res.status(400).json({ error: 'Name is required.' });
    const params = cols.map((c) => req.body[c]);
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const { rows } = await db.query(
      `INSERT INTO ${def.table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, params
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

router.put('/taxonomy/:kind/:id', async (req, res, next) => {
  try {
    const def = taxDef(req, res); if (!def) return;
    const cols = def.cols.filter((c) => req.body[c] !== undefined);
    if (!cols.length) return res.status(400).json({ error: 'Nothing to update.' });
    const params = cols.map((c) => req.body[c]);
    params.push(parseInt(req.params.id, 10));
    const { rows } = await db.query(
      `UPDATE ${def.table} SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')} WHERE id = $${params.length} RETURNING *`, params
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found.' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/taxonomy/:kind/:id', async (req, res, next) => {
  try {
    const def = taxDef(req, res); if (!def) return;
    await db.query(`DELETE FROM ${def.table} WHERE id = $1`, [parseInt(req.params.id, 10)]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ---------- Site settings (contact details, theme, home page texts) ----------
// Returns the values in force, the defaults, and which keys have been changed by staff.
router.get('/settings', async (_req, res, next) => {
  try {
    const defaults = siteDefaults();
    const changed = await settings.overrides();
    res.json({ values: { ...defaults, ...changed }, defaults, changed: Object.keys(changed) });
  } catch (e) { next(e); }
});

router.put('/settings', async (req, res, next) => {
  try {
    const bad = await settings.save(req.body);
    if (bad.length) return res.status(400).json({ error: 'Please check: ' + bad.join(', ') + '. Phone numbers need 7-20 digits, links must start with http(s)://, colours must look like #1a7f5a.' });
    const defaults = siteDefaults();
    const changed = await settings.overrides();
    res.json({ values: { ...defaults, ...changed }, defaults, changed: Object.keys(changed) });
  } catch (e) { next(e); }
});

// ---------- Testimonials (home page reviews) ----------
const reviewFields = (b) => ({
  name: String(b.name || '').trim().slice(0, 200),
  role: String(b.role || '').trim().slice(0, 250),
  quote: String(b.quote || '').trim().slice(0, 4000),
  lang: b.lang === 'si' ? 'si' : 'en',
  image: String(b.image || '').trim().slice(0, 2000),
  featured: !!b.featured,
  status: b.status === 0 || b.status === false ? 0 : 1,
});

router.get('/testimonials', async (_req, res, next) => {
  try { res.json((await db.query('SELECT * FROM testimonials ORDER BY featured DESC, id')).rows); } catch (e) { next(e); }
});

router.post('/testimonials', async (req, res, next) => {
  try {
    const t = reviewFields(req.body);
    if (!t.name || !t.quote) return res.status(400).json({ error: 'Name and review text are required.' });
    if (t.featured) await db.query('UPDATE testimonials SET featured = false');
    const { rows } = await db.query(
      'INSERT INTO testimonials (name, role, quote, lang, image, featured, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [t.name, t.role, t.quote, t.lang, t.image, t.featured, t.status]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

router.put('/testimonials/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const cur = (await db.query('SELECT * FROM testimonials WHERE id = $1', [id])).rows[0];
    if (!cur) return res.status(404).json({ error: 'Not found.' });
    const t = reviewFields({ ...cur, ...req.body });
    if (!t.name || !t.quote) return res.status(400).json({ error: 'Name and review text are required.' });
    if (t.featured) await db.query('UPDATE testimonials SET featured = false WHERE id <> $1', [id]);
    const { rows } = await db.query(
      'UPDATE testimonials SET name=$1, role=$2, quote=$3, lang=$4, image=$5, featured=$6, status=$7 WHERE id=$8 RETURNING *',
      [t.name, t.role, t.quote, t.lang, t.image, t.featured, t.status, id]);
    if (cur.image && cur.image !== t.image) deleteStoredImages([cur.image]);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.delete('/testimonials/:id', async (req, res, next) => {
  try {
    const { rows } = await db.query('DELETE FROM testimonials WHERE id = $1 RETURNING image', [parseInt(req.params.id, 10)]);
    if (rows[0]) deleteStoredImages([rows[0].image]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
