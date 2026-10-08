// Customer submissions: vehicle quote / viewing / contact forms, newsletter, and auction requests.
const express = require('express');
const db = require('../../db/pool');
const router = express.Router();

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));
const clip = (s, n) => String(s == null ? '' : s).slice(0, n);
const KINDS = ['Stock quote', 'Viewing', 'Contact', 'Sell your car'];

// POST /api/inquiries — quote request, viewing booking, or a contact-page message.
router.post('/inquiries', async (req, res, next) => {
  try {
    const b = req.body || {};
    const name = clip(b.name, 200).trim();
    const email = clip(b.email, 200).trim();
    const phone = clip(b.phone, 50).trim();
    if (name.length < 2) return res.status(400).json({ error: 'Please tell us your name.' });
    if (!isEmail(email) && phone.length < 7) return res.status(400).json({ error: 'A valid email or phone number is required.' });
    if (email && !isEmail(email)) return res.status(400).json({ error: 'That email address looks wrong.' });

    const kind = KINDS.includes(b.kind) ? b.kind : 'Stock quote';
    const extra = [
      b.pref ? `Reply on: ${clip(b.pref, 30)}` : '',
      b.date ? `Preferred day: ${clip(b.date, 20)}` : '',
      b.location ? `Location: ${clip(b.location, 60)}` : '',
    ].filter(Boolean).join('\n');
    const message = [clip(b.message, 4000).trim() || `${kind} request`, extra].filter(Boolean).join('\n\n');

    const vehicleId = parseInt(b.vehicle_id, 10);
    const { rows } = await db.query(
      `INSERT INTO inquiries (vehicle_id, uid, name, email, phone, message, kind)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [Number.isInteger(vehicleId) ? vehicleId : null, req.user ? req.user.uid : null, name, email, phone, message, kind]
    );
    res.status(201).json({ ok: true, ref: 'INQ-' + (24000 + rows[0].id), message: 'Thank you! Your inquiry has been sent.' });
  } catch (e) { next(e); }
});

// POST /api/newsletter — footer subscribe form.
router.post('/newsletter', async (req, res, next) => {
  try {
    const { name, email } = req.body || {};
    if (!isEmail(email)) return res.status(400).json({ error: 'A valid email address is required.' });
    const exists = await db.query('SELECT 1 FROM newsletters WHERE lower(email) = lower($1)', [email]);
    if (!exists.rowCount) await db.query('INSERT INTO newsletters (name, email) VALUES ($1, $2)', [clip(name, 200), clip(email, 200)]);
    res.status(201).json({ ok: true, message: 'Subscribed successfully!' });
  } catch (e) { next(e); }
});

// POST /api/live-inquiries — "request a bid": tell us the car, we find the lot.
router.post('/live-inquiries', async (req, res, next) => {
  try {
    const b = req.body || {};
    const make = clip(b.make, 100).trim();
    if (!make) return res.status(400).json({ error: 'Please choose a make.' });
    const name = clip(b.name || (req.user && req.user.name), 200).trim();
    const phone = clip(b.phone || (req.user && req.user.phone), 50).trim();
    if (name.length < 2 || phone.length < 7) return res.status(400).json({ error: 'Your name and mobile number are required.' });

    const details = {
      chassis: clip(b.chassis, 50), yearFrom: clip(b.yFrom, 4), yearTo: clip(b.yTo, 4),
      colours: Array.isArray(b.colours) ? b.colours.slice(0, 10).map((c) => clip(c, 30)) : [],
      budget: Number(b.budget) || null, maxKm: Number(b.km) || null,
    };
    const { rows } = await db.query(
      `INSERT INTO live_inquiries (uid, name, email, phone, make, model, year, color, grade, message, kind, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'Auction request',$11) RETURNING id`,
      [req.user ? req.user.uid : null, name, clip(b.email || (req.user && req.user.email), 200), phone,
       make, clip(b.model, 100).trim() || 'Any model', details.yearFrom && details.yearTo ? `${details.yearFrom}-${details.yearTo}` : '',
       details.colours.join(', '), clip(b.grade, 50), clip(b.message, 2000), JSON.stringify(details)]
    );
    res.status(201).json({ ok: true, ref: 'AR-' + (3000 + rows[0].id), message: 'Your auction request has been submitted.' });
  } catch (e) { next(e); }
});

module.exports = router;
