// Full backup and restore of everything the website stores in its database: cars, brands, models, colours,
// features, reviews, settings (texts, colours, fonts, seasons), inquiries, auction requests, customers,
// newsletter, the admin list. Car PHOTOS live in Firebase Storage (separate from the database and never touched
// by a deployment); the backup keeps each photo's link.
const fs = require('fs');
const db = require('../db/pool');
const mailer = require('./mailer');
const photos = require('./backupPhotos');
const storage = require('./storage');

// Order matters for restore (a table comes after the tables it points to).
const TABLES = ['vehicle_type', 'vehicle_manufacturer', 'vehicle_model', 'vehicle_color', 'vehicle_feature', 'vehicle',
  'testimonials', 'settings', 'profiles', 'inquiries', 'live_inquiries', 'newsletters', 'admin_emails', 'app_meta'];
const SERIAL = ['vehicle_type', 'vehicle_manufacturer', 'vehicle_model', 'vehicle_color', 'vehicle_feature', 'vehicle',
  'testimonials', 'inquiries', 'live_inquiries', 'newsletters'];
const LABELS = { vehicle: 'vehicles', vehicle_manufacturer: 'brands', vehicle_model: 'models', vehicle_type: 'body types', vehicle_color: 'colours',
  vehicle_feature: 'features', testimonials: 'reviews', settings: 'saved settings', profiles: 'customers', inquiries: 'inquiries',
  live_inquiries: 'auction requests', newsletters: 'newsletter subscribers', admin_emails: 'admin emails', app_meta: 'internal flags' };
const KEEP_POINTS = 7;

const quote = (t) => `"${t}"`;   // table names come from the constant list above, never from a request

async function exportAll(client = db) {
  const tables = {}, counts = {};
  for (const t of TABLES) {
    const { rows } = await client.query(`SELECT COALESCE(jsonb_agg(x), '[]'::jsonb) AS rows FROM ${quote(t)} x`);
    tables[t] = rows[0].rows; counts[t] = tables[t].length;
  }
  return { app: 'direct-auto-backup', version: 1, created_at: new Date().toISOString(), counts, tables };
}

async function counts() {
  const out = {};
  for (const t of TABLES) out[t] = (await db.query(`SELECT COUNT(*)::int AS n FROM ${quote(t)}`)).rows[0].n;
  return out;
}

// Checks a backup file before anything is touched.
function validate(b) {
  if (!b || b.app !== 'direct-auto-backup' || typeof b.tables !== 'object') throw new Error('This is not a Direct Auto backup file.');
  for (const t of TABLES) if (!Array.isArray(b.tables[t])) throw new Error(`The backup is incomplete (missing "${t}"). Use a full backup made from Admin > Backup.`);
}

// Replaces the live data with the backup, all or nothing. A restore point of the current data is saved first.
async function restoreAll(backup) {
  validate(backup);
  const point = await savePoint('before-restore');
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`TRUNCATE ${TABLES.map(quote).join(', ')} RESTART IDENTITY CASCADE`);
    for (const t of TABLES) {
      const rows = backup.tables[t];
      if (!rows.length) continue;
      // Only columns that are present in the file are filled, so columns added later keep their defaults.
      const cols = (await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`, [t])).rows.map((r) => r.column_name);
      const present = cols.filter((c) => rows.some((r) => r && Object.prototype.hasOwnProperty.call(r, c)));
      const list = present.map(quote).join(', ');
      await client.query(`INSERT INTO ${quote(t)} (${list}) SELECT ${list} FROM jsonb_populate_recordset(NULL::${quote(t)}, $1::jsonb)`, [JSON.stringify(rows)]);
    }
    for (const t of SERIAL) await client.query(`SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE((SELECT MAX(id) FROM ${quote(t)}), 1), (SELECT COUNT(*) > 0 FROM ${quote(t)}))`);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw new Error('The restore failed and nothing was changed. ' + e.message);
  } finally { client.release(); }
  return { ok: true, restorePoint: point };
}

// Restores from an uploaded backup file on disk: a .zip (data + photos) or an older .json (data only).
const userError = (msg) => Object.assign(new Error(msg), { status: 400 });
async function restoreFromFile(filePath) {
  const fd = fs.openSync(filePath, 'r'); const head = Buffer.alloc(4);
  try { fs.readSync(fd, head, 0, 4, 0); } finally { fs.closeSync(fd); }
  if (head.toString('latin1') === 'PK\u0003\u0004') return restoreFromZip(filePath);

  let data;
  try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (_e) { throw userError('That file is not a valid backup (it could not be read).'); }
  try { validate(data); } catch (e) { throw userError(e.message); }
  const r = await restoreAll(data);
  return { ...r, counts: data.counts, photos: { found: 0, restored: 0, kept: photos.collectUrls(data.tables).length, failed: 0 }, format: 'json' };
}

async function restoreFromZip(filePath) {
  let zip;
  try { zip = await photos.openZip(filePath); } catch (e) { throw userError(e.message); }
  try {
    if (!zip.has('data.json')) throw userError('This .zip is not a Direct Auto backup (data.json is missing).');
    let data;
    try { data = JSON.parse((await zip.read('data.json', photos.MAX_DATA)).toString('utf8')); } catch (_e) { throw userError('The data inside this backup could not be read.'); }
    try { validate(data); } catch (e) { throw userError(e.message); }

    // Photos: put each back into Firebase Storage and remember the new link. Without Storage the old links stay.
    const files = (data.images && Array.isArray(data.images.files)) ? data.images.files : [];
    const report = { found: files.length, restored: 0, kept: 0, failed: 0 };
    const map = new Map(), canUpload = storage.configured();
    for (const f of files) {
      const okPath = f && typeof f.url === 'string' && /^images\/[A-Za-z0-9._-]+$/.test(String(f.path));
      if (!okPath || !photos.isRemote(f.url) || !canUpload) { report.kept++; continue; }   // site files (/assets/...) never need re-uploading
      try {
        const buf = await zip.read(f.path, photos.MAX_PHOTO);
        map.set(f.url, await storage.uploadBuffer(buf, storage.EXT[f.type] ? f.type : 'image/jpeg', 'restored', f.path.split('/').pop()));
        report.restored++;
      } catch (e) { report.failed++; console.error('[restore] photo %s not re-uploaded: %s', f.path, e.message); }
    }
    if (map.size) photos.rewriteUrls(data.tables, map);
    const r = await restoreAll(data);
    return { ...r, counts: data.counts, photos: report, storageReady: canUpload, format: 'zip' };
  } finally { zip.close(); }
}

async function savePoint(kind) {
  const data = await exportAll();
  const { rows } = await db.query('INSERT INTO backups (kind, counts, data) VALUES ($1, $2, $3) RETURNING id, created_at', [kind, JSON.stringify(data.counts), JSON.stringify(data)]);
  // Keep only the newest few.
  await db.query('DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY id DESC LIMIT $1)', [KEEP_POINTS]);
  return rows[0];
}

const stamp = () => new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
const fileName = () => `direct-auto-backup-${stamp()}.json`;      // data only (older format, still downloadable)
const zipName = () => `direct-auto-backup-${stamp()}.zip`;        // data + every photo

// How many different photos the data points at (shown on the Backup page).
async function photoCount() {
  const tables = {};
  for (const [t, col] of photos.IMAGE_COLUMNS) {
    const { rows } = await db.query(`SELECT ${quote(col)} AS v FROM ${quote(t)}`);   // table and column come from the fixed list
    tables[t] = rows.map((r) => ({ [col]: r.v }));
  }
  return photos.collectUrls(tables).length;
}

// Streams the full backup (data + photos) as a ZIP.
async function writeZip(out) { return photos.writeZip(out, await exportAll()); }

// Emails the backup through the Google mail script: a ZIP with the photos when it fits (15 MB), otherwise the data file alone.
const EMAIL_LIMIT = 15 * 1048576;
async function emailBackup(kind) {
  const data = await exportAll();
  const summary = TABLES.filter((t) => t !== 'app_meta' && t !== 'settings').map((t) => [LABELS[t], data.counts[t]]);
  let zip = null;
  try { zip = await photos.zipToBuffer(data, EMAIL_LIMIT); } catch (e) { console.error('[backup] could not prepare the photos for the email:', e.message); }
  const payload = { kind, summary };
  let tooBig = false;
  if (zip) {
    payload.filename = zipName(); payload.base64 = zip.buffer.toString('base64'); payload.sizeMb = Math.round(zip.buffer.length / 104857.6) / 10;
    summary.push(['photos included', zip.photos]); if (zip.missing) summary.push(['photos that could not be saved', zip.missing]);
  } else {
    const json = JSON.stringify(data); const mb = Buffer.byteLength(json) / 1048576;
    payload.filename = fileName(); payload.sizeMb = Math.round(mb * 10) / 10;
    if (mb <= 15) payload.base64 = Buffer.from(json).toString('base64');   // bigger than 15 MB: send the summary only
    tooBig = true;                                                          // the photos did not fit; download from Admin to get them
    summary.push(['photos included', 0]);
  }
  const r = await mailer.send('backup', payload);
  return { ...r, tooBig, withPhotos: !!zip };
}

// "Email me a backup every day / week": checked every hour while the server runs.
async function runSchedule() {
  try {
    const o = await require('./settings').overrides();
    const every = o.backupEvery;
    if (!every || !mailer.enabled()) return;
    const last = (await db.query("SELECT value FROM settings WHERE key = 'backupLast'")).rows[0];
    const lastAt = last ? Number(last.value) : 0;
    const due = (every === 'daily' ? 23 : 24 * 7 - 1) * 3600 * 1000;
    if (Date.now() - lastAt < due) return;
    const r = await emailBackup('automatic');
    await savePoint('auto');
    if (r.ok) await db.query("INSERT INTO settings (key, value) VALUES ('backupLast', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()", [String(Date.now())]);
  } catch (e) { console.error('[backup] scheduled backup failed:', e.message); }
}
function startSchedule() {
  setTimeout(runSchedule, 60 * 1000).unref();
  setInterval(runSchedule, 60 * 60 * 1000).unref();
}

module.exports = { TABLES, LABELS, exportAll, counts, restoreAll, restoreFromFile, savePoint, emailBackup, startSchedule, runSchedule, fileName, zipName, writeZip, photoCount, validate, KEEP_POINTS };
