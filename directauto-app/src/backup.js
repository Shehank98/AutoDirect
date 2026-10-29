// Full backup and restore of everything the website stores in its database: cars, brands, models, colours,
// features, reviews, settings (texts, colours, fonts, seasons), inquiries, auction requests, customers,
// newsletter, the admin list. Car PHOTOS live in Firebase Storage (separate from the database and never touched
// by a deployment); the backup keeps each photo's link.
const db = require('../db/pool');
const mailer = require('./mailer');

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

async function savePoint(kind) {
  const data = await exportAll();
  const { rows } = await db.query('INSERT INTO backups (kind, counts, data) VALUES ($1, $2, $3) RETURNING id, created_at', [kind, JSON.stringify(data.counts), JSON.stringify(data)]);
  // Keep only the newest few.
  await db.query('DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY id DESC LIMIT $1)', [KEEP_POINTS]);
  return rows[0];
}

const stamp = () => new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
const fileName = () => `direct-auto-backup-${stamp()}.json`;

// Emails the backup file through the Google mail script.
async function emailBackup(kind) {
  const data = await exportAll();
  const json = JSON.stringify(data);
  const mb = Buffer.byteLength(json) / 1048576;
  const summary = TABLES.filter((t) => t !== 'app_meta' && t !== 'settings').map((t) => [LABELS[t], data.counts[t]]);
  const payload = { kind, filename: fileName(), summary, sizeMb: Math.round(mb * 10) / 10 };
  if (mb <= 15) payload.base64 = Buffer.from(json).toString('base64');   // bigger than 15 MB: send the summary only
  const r = await mailer.send('backup', payload);
  return { ...r, tooBig: mb > 15 };
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

module.exports = { TABLES, LABELS, exportAll, counts, restoreAll, savePoint, emailBackup, startSchedule, runSchedule, fileName, validate, KEEP_POINTS };
