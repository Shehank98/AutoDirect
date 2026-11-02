// Admin > Backup: download everything, restore from a file, restore points, email backups.
const fs = require('fs');
const os = require('os');
const express = require('express');
const multer = require('multer');
const db = require('../../db/pool');
const backup = require('../backup');
const mailer = require('../mailer');

const router = express.Router();
// Backup files (a .zip with photos can be large) are written to a temporary file, not held in memory.
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 250 * 1024 * 1024 } });

router.get('/summary', async (_req, res, next) => {
  try {
    const [counts, points, last, photos] = await Promise.all([
      backup.counts(),
      db.query('SELECT id, kind, created_at, counts FROM backups ORDER BY id DESC'),
      db.query("SELECT value FROM settings WHERE key = 'backupLast'"),
      backup.photoCount().catch(() => null),
    ]);
    res.json({
      counts, labels: backup.LABELS, tables: backup.TABLES.filter((t) => t !== 'app_meta'),
      points: points.rows, lastEmailed: last.rows[0] ? Number(last.rows[0].value) : null,
      emailReady: mailer.enabled(), keep: backup.KEEP_POINTS, photos,
    });
  } catch (e) { next(e); }
});

// The file download: a .zip with the data and every photo (?format=json gives the older data-only file).
// (Sent with the sign-in header, so the browser fetches it and saves it.)
router.get('/download', async (req, res, next) => {
  try {
    if (req.query.format === 'json') {
      const data = await backup.exportAll();
      res.set({ 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="${backup.fileName()}"`, 'Cache-Control': 'no-store' });
      return res.send(JSON.stringify(data));
    }
    res.set({ 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${backup.zipName()}"`, 'Cache-Control': 'no-store' });
    await backup.writeZip(res);
  } catch (e) {
    if (!res.headersSent) return next(e);
    console.error('[backup] download stopped part-way:', e.message);
    res.destroy(e);                                  // the browser sees a failed download instead of a broken file
  }
});

// Restore from an uploaded backup file (.zip with photos, or an older .json).
// Must be confirmed by typing RESTORE; a restore point is saved first.
router.post('/restore', upload.single('file'), async (req, res) => {
  const file = req.file;
  try {
    if (String(req.body && req.body.confirm).trim() !== 'RESTORE') return res.status(400).json({ error: 'Type RESTORE to confirm.' });
    if (!file) return res.status(400).json({ error: 'Choose a backup file first.' });
    const r = await backup.restoreFromFile(file.path);
    res.json({ ok: true, counts: r.counts, restorePoint: r.restorePoint, photos: r.photos, storageReady: r.storageReady, format: r.format });
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
  finally { if (file) fs.unlink(file.path, () => {}); }
});

// Undo / go back: restore one of the saved restore points.
router.post('/points/:id/restore', async (req, res) => {
  try {
    if (String(req.body && req.body.confirm).trim() !== 'RESTORE') return res.status(400).json({ error: 'Type RESTORE to confirm.' });
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1 || id > 2147483647) return res.status(404).json({ error: 'That restore point no longer exists.' });
    const row = (await db.query('SELECT data FROM backups WHERE id = $1', [id])).rows[0];
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
