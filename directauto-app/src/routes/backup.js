// Admin > Backup: download everything, restore from a file, restore points, email backups.
const express = require('express');
const multer = require('multer');
const db = require('../../db/pool');
const backup = require('../backup');
const mailer = require('../mailer');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 150 * 1024 * 1024 } });

router.get('/summary', async (_req, res, next) => {
  try {
    const [counts, points, last] = await Promise.all([
      backup.counts(),
      db.query('SELECT id, kind, created_at, counts FROM backups ORDER BY id DESC'),
      db.query("SELECT value FROM settings WHERE key = 'backupLast'"),
    ]);
    res.json({
      counts, labels: backup.LABELS, tables: backup.TABLES.filter((t) => t !== 'app_meta'),
      points: points.rows, lastEmailed: last.rows[0] ? Number(last.rows[0].value) : null,
      emailReady: mailer.enabled(), keep: backup.KEEP_POINTS,
    });
  } catch (e) { next(e); }
});

// The file download. (Sent with the sign-in header, so the browser fetches it and saves it.)
router.get('/download', async (_req, res, next) => {
  try {
    const data = await backup.exportAll();
    res.set({ 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="${backup.fileName()}"`, 'Cache-Control': 'no-store' });
    res.send(JSON.stringify(data));
  } catch (e) { next(e); }
});

// Restore from an uploaded backup file. Must be confirmed by typing RESTORE; a restore point is saved first.
router.post('/restore', upload.single('file'), async (req, res, next) => {
  try {
    if (String(req.body && req.body.confirm).trim() !== 'RESTORE') return res.status(400).json({ error: 'Type RESTORE to confirm.' });
    if (!req.file) return res.status(400).json({ error: 'Choose a backup file first.' });
    let data;
    try { data = JSON.parse(req.file.buffer.toString('utf8')); } catch (_e) { return res.status(400).json({ error: 'That file is not a valid backup (it could not be read).' }); }
    try { backup.validate(data); } catch (e) { return res.status(400).json({ error: e.message }); }
    const r = await backup.restoreAll(data);
    res.json({ ok: true, counts: data.counts, restorePoint: r.restorePoint });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Undo / go back: restore one of the saved restore points.
router.post('/points/:id/restore', async (req, res) => {
  try {
    if (String(req.body && req.body.confirm).trim() !== 'RESTORE') return res.status(400).json({ error: 'Type RESTORE to confirm.' });
    const row = (await db.query('SELECT data FROM backups WHERE id = $1', [parseInt(req.params.id, 10)])).rows[0];
    if (!row) return res.status(404).json({ error: 'That restore point no longer exists.' });
    const r = await backup.restoreAll(row.data);
    res.json({ ok: true, restorePoint: r.restorePoint });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/email-now', async (_req, res, next) => {
  try {
    if (!mailer.enabled()) return res.status(400).json({ error: 'Email is not connected yet (see docs/email/SETUP.md).' });
    const r = await backup.emailBackup('manual');
    if (!r.ok) return res.status(502).json({ error: r.error });
    await db.query("INSERT INTO settings (key, value) VALUES ('backupLast', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()", [String(Date.now())]);
    res.json({ ok: true, to: r.to || [], tooBig: r.tooBig });
  } catch (e) { next(e); }
});

module.exports = router;
