// Proxy bids on the auction floor. Lots are managed in the admin; a bid is recorded as an
// "Auction bid" request that the auction desk follows up (we never bid automatically).
const express = require('express');
const db = require('../../db/pool');
const { requireAuth } = require('../auth');
const router = express.Router();

router.post('/lots/:id/bid', requireAuth, async (req, res, next) => {
  try {
    const max = Math.round(Number(req.body && req.body.max));
    const { rows } = await db.query(
      `SELECT * FROM auction_lots WHERE id = $1 AND status = 1 AND (ends_at IS NULL OR ends_at > now())`,
      [parseInt(req.params.id, 10)]
    );
    const lot = rows[0];
    if (!lot) return res.status(404).json({ error: 'This lot has closed or is no longer available.' });
    const current = lot.current_price || lot.start_price || 0;
    if (!Number.isFinite(max) || max <= current) {
      return res.status(400).json({ error: `Your maximum must be above the current bid of ¥${current.toLocaleString('en-US')}.` });
    }
    const out = await db.query(
      `INSERT INTO live_inquiries (uid, name, email, phone, make, model, year, grade, message, kind, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Auction bid',$10) RETURNING id`,
      [req.user.uid, req.user.name || '', req.user.email || '', req.user.phone || '', lot.make, lot.model,
       String(lot.year || ''), lot.auction_grade || '',
       `Proxy maximum ¥${max.toLocaleString('en-US')} on lot ${lot.lot_no} (${lot.house})`,
       JSON.stringify({ lotId: lot.id, lotNo: lot.lot_no, house: lot.house, max, chassis: lot.chassis })]
    );
    res.status(201).json({ ok: true, ref: 'AR-' + (3000 + out.rows[0].id) });
  } catch (e) { next(e); }
});

module.exports = router;
