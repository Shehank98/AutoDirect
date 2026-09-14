// Vehicle inquiry + newsletter + live-auction request submissions.
const express = require('express');
const db = require('../../db/pool');
const router = express.Router();

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));

// POST /api/inquiries  — "I'm interested in this vehicle" form.
router.post('/inquiries', async (req, res, next) => {
  try {
    const { vehicle_id, name, email, phone, message } = req.body || {};
    if (!name || !isEmail(email) || !message) {
      return res.status(400).json({ error: 'Name, a valid email and a message are required.' });
    }
    const uid = req.user ? req.user.uid : null;
    await db.query(
      `INSERT INTO inquiries (vehicle_id, uid, name, email, phone, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [vehicle_id ? parseInt(vehicle_id, 10) : null, uid, name, email, phone || '', message]
    );
    res.status(201).json({ ok: true, message: 'Thank you! Your inquiry has been sent.' });
  } catch (e) { next(e); }
});

// POST /api/newsletter  — footer subscribe form.
router.post('/newsletter', async (req, res, next) => {
  try {
    const { name, email } = req.body || {};
    if (!isEmail(email)) return res.status(400).json({ error: 'A valid email address is required.' });
    await db.query('INSERT INTO newsletters (name, email) VALUES ($1, $2)', [name || '', email]);
    res.status(201).json({ ok: true, message: 'Subscribed successfully!' });
  } catch (e) { next(e); }
});

// POST /api/live-inquiries  — "request auction data / quote" form.
router.post('/live-inquiries', async (req, res, next) => {
  try {
    const { make, model, year, color, grade, message, name, email } = req.body || {};
    if (!make || !model) return res.status(400).json({ error: 'Make and model are required.' });
    const uid = req.user ? req.user.uid : null;
    await db.query(
      `INSERT INTO live_inquiries (uid, name, email, make, model, year, color, grade, message)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [uid, name || (req.user ? req.user.name : ''), email || (req.user ? req.user.email : ''),
       make, model, year || '', color || '', grade || '', message || '']
    );
    res.status(201).json({ ok: true, message: 'Your auction request has been submitted.' });
  } catch (e) { next(e); }
});

module.exports = router;
