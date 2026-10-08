// Logged-in customer account endpoints (Firebase Auth required).
const express = require('express');
const db = require('../../db/pool');
const { requireAuth } = require('../auth');
const router = express.Router();

router.use(requireAuth);

// GET /api/account/me  — current profile.
router.get('/me', (req, res) => res.json(req.user));

// PUT /api/account/me  — update profile details.
router.put('/me', async (req, res, next) => {
  try {
    const { name, phone, address } = req.body || {};
    const { rows } = await db.query(
      `UPDATE profiles SET name = $2, phone = $3, address = $4, updated_at = now()
        WHERE uid = $1 RETURNING *`,
      [req.user.uid, name || '', phone || '', address || '']
    );
    res.json(rows[0]);
  } catch (e) { next(e); }
});

// GET /api/account/inquiries  — this user's vehicle inquiries.
router.get('/inquiries', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT i.*, v.seo_url, v.year,
              m.name AS manufacturer_name, mo.name AS model_name
         FROM inquiries i
         LEFT JOIN vehicle v  ON v.id = i.vehicle_id
         LEFT JOIN vehicle_manufacturer m ON m.id = v.vehicle_manufacturer
         LEFT JOIN vehicle_model mo ON mo.id = v.vehicle_model
        WHERE i.uid = $1
        ORDER BY i.created_at DESC`,
      [req.user.uid]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/account/live-inquiries  — this user's auction requests.
router.get('/live-inquiries', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM live_inquiries WHERE uid = $1 ORDER BY created_at DESC', [req.user.uid]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/account/orders — every inquiry and auction request in one list, in the shape the
// order tracker renders (stage 0..6 is updated by the sales team from the admin).
router.get('/orders', async (req, res, next) => {
  try {
    const [inq, live] = await Promise.all([
      db.query(
        `SELECT i.id, i.kind, i.stage, i.note, i.eta, i.created_at, v.year,
                m.name AS make, mo.name AS model, v.trim
           FROM inquiries i
           LEFT JOIN vehicle v ON v.id = i.vehicle_id
           LEFT JOIN vehicle_manufacturer m ON m.id = v.vehicle_manufacturer
           LEFT JOIN vehicle_model mo ON mo.id = v.vehicle_model
          WHERE i.uid = $1`, [req.user.uid]),
      db.query('SELECT * FROM live_inquiries WHERE uid = $1', [req.user.uid]),
    ]);
    const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
    const items = [
      ...inq.rows.map((r) => ({
        ref: 'INQ-' + (24000 + r.id), kind: r.kind, stage: r.stage, note: r.note || '', eta: fmt(r.eta), date: r.created_at,
        vehicle: r.make ? [r.year, r.make, r.model, r.trim].filter(Boolean).join(' ') : r.kind,
      })),
      ...live.rows.map((r) => ({
        ref: 'AR-' + (3000 + r.id), kind: r.kind, stage: r.stage, note: r.note || '', eta: fmt(r.eta), date: r.created_at,
        vehicle: [r.year && r.kind === 'Auction bid' ? r.year : '', r.make, r.model].filter(Boolean).join(' '),
        detail: r.message,
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(items);
  } catch (e) { next(e); }
});

module.exports = router;
