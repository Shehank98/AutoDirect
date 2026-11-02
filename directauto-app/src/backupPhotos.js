// The photo half of a backup: find every photo the data points at, put the files into a ZIP next to the data,
// and read them back when restoring.
//
//   backup.zip
//     data.json        everything in the database (cars, brands, settings, reviews, customers...) + a photo list
//     images/0001-...  one file per photo
//     README.txt       what is inside and how to restore
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;
const net = require('net');
const archiver = require('archiver');
const yauzl = require('yauzl');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAX_PHOTO = 25 * 1024 * 1024;        // per photo
const MAX_DATA = 150 * 1024 * 1024;        // data.json
const EXT_OF = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif' };
const TYPE_OF = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif' };

// Where photo links live in the data: [table, column, isList]
const IMAGE_COLUMNS = [['vehicle', 'images', true], ['vehicle_manufacturer', 'image', false], ['vehicle_type', 'image', false],
  ['vehicle_feature', 'image', false], ['testimonials', 'image', false]];

const isUrlish = (s) => typeof s === 'string' && (/^https?:\/\//i.test(s) || /^\/[^/]/.test(s));
const isRemote = (s) => /^https?:\/\//i.test(s);

// Every distinct photo link in the data, in a stable order.
function collectUrls(tables) {
  const seen = new Set();
  for (const [t, col, list] of IMAGE_COLUMNS) {
    for (const row of tables[t] || []) {
      const v = row && row[col];
      for (const u of list ? (Array.isArray(v) ? v : []) : [v]) if (isUrlish(u)) seen.add(u);
    }
  }
  return [...seen];
}

// Replaces photo links using a Map(old -> new). Changes the given tables in place.
function rewriteUrls(tables, map) {
  for (const [t, col, list] of IMAGE_COLUMNS) {
    for (const row of tables[t] || []) {
      if (!row) continue;
      if (list) { if (Array.isArray(row[col])) row[col] = row[col].map((u) => map.get(u) || u); }
      else if (map.has(row[col])) row[col] = map.get(row[col]);
    }
  }
}

/* ---------------------------------------------------------------- fetching photos (backup) */

function privateAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
  }
  const x = ip.toLowerCase();
  return x === '::1' || x === '::' || x.startsWith('fc') || x.startsWith('fd') || x.startsWith('fe80') || x.startsWith('::ffff:127.') || x.startsWith('::ffff:10.') || x.startsWith('::ffff:192.168.');
}
// Photo links are staff-entered, so keep the server from being pointed at internal addresses.
async function assertPublicHost(u) {
  const host = u.hostname.replace(/^\[|\]$/g, '');
  const dev = process.env.NODE_ENV !== 'production';                      // local testing may use localhost
  if (!/^https?:$/.test(u.protocol)) throw new Error('unsupported link');
  if (u.protocol === 'http:' && !dev) throw new Error('not a secure (https) link');
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addrs.length) throw new Error('could not find the host');
  if (!dev && addrs.some((a) => privateAddress(a.address))) throw new Error('points at a private address');
}

async function fetchRemote(url) {
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    const u = new URL(current);
    await assertPublicHost(u);
    const res = await fetch(u, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'DirectAuto-backup' } });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) { current = new URL(res.headers.get('location'), u).toString(); continue; }
    if (!res.ok) throw new Error(`the photo link answered ${res.status}`);
    const len = Number(res.headers.get('content-length') || 0);
    if (len > MAX_PHOTO) throw new Error('photo is larger than 25 MB');
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > MAX_PHOTO) throw new Error('photo is larger than 25 MB');
    return { buffer, type: (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase(), name: u.pathname };
  }
  throw new Error('too many redirects');
}

function readLocal(url) {
  const rel = decodeURIComponent(url.split('?')[0]);
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) throw new Error('not a site file');
  const buffer = fs.readFileSync(file);
  return { buffer, type: TYPE_OF[path.extname(file).slice(1).toLowerCase()] || '', name: rel };
}

async function fetchPhoto(url) {
  const r = isRemote(url) ? await fetchRemote(url) : readLocal(url);
  const ext = path.extname(String(r.name)).slice(1).toLowerCase();
  const type = r.type.startsWith('image/') ? r.type : TYPE_OF[ext] || '';
  if (!type) throw new Error('it is not an image');
  return { buffer: r.buffer, type, name: r.name };
}

function fileNameFor(n, photo) {
  let base = '';
  try { base = decodeURIComponent(String(photo.name).split('/').pop()); } catch (_e) { base = String(photo.name).split('/').pop(); }
  base = base.replace(/\.[A-Za-z0-9]+$/, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'photo';
  return `images/${String(n).padStart(4, '0')}-${base}.${EXT_OF[photo.type] || 'jpg'}`;
}

/* ---------------------------------------------------------------- writing the ZIP */

// Streams a backup ZIP into `out`. With maxBytes, gives up (error.tooBig) when the photos would not fit.
async function writeZip(out, data, { maxBytes } = {}) {
  const archive = archiver('zip', { zlib: { level: 6 } });
  const finished = new Promise((resolve, reject) => {
    out.on('finish', resolve); out.on('close', resolve); out.on('error', reject); archive.on('error', reject);
  });
  archive.pipe(out);

  const files = [], missing = [];
  let total = 0, n = 0;
  for (const url of collectUrls(data.tables)) {
    let photo;
    try { photo = await fetchPhoto(url); } catch (e) { missing.push({ url, why: e.message }); continue; }
    total += photo.buffer.length;
    if (maxBytes && total > maxBytes) { archive.abort(); const e = new Error('photos are too big to attach'); e.tooBig = true; throw e; }
    const name = fileNameFor(++n, photo);
    const added = new Promise((r) => archive.once('entry', r));
    archive.append(photo.buffer, { name, store: true });       // photos are already compressed
    await added;                                                 // one photo in memory at a time
    files.push({ url, path: name, type: photo.type, size: photo.buffer.length });
  }

  const manifest = { ...data, version: 2, images: { files, missing } };
  archive.append(JSON.stringify(manifest), { name: 'data.json' });
  archive.append(readme(data, files, missing), { name: 'README.txt' });
  await archive.finalize();
  await finished;
  return { photos: files.length, missing: missing.length, bytes: total };
}

function readme(data, files, missing) {
  const rows = Object.entries(data.counts || {}).filter(([k]) => k !== 'app_meta').map(([k, v]) => `  ${k}: ${v}`).join('\n');
  return [`Direct Auto backup, made ${data.created_at}`, '', 'Inside:', '  data.json   all website data (cars, brands, models, settings, reviews, customers, inquiries, admins)',
    `  images/     ${files.length} photo file(s)`, '', 'Counts:', rows, '',
    missing.length ? `${missing.length} photo(s) could not be downloaded and are NOT in this file (their links are kept in data.json):\n${missing.map((m) => `  ${m.url}  (${m.why})`).join('\n')}\n` : 'Every photo was saved.',
    '', 'To restore: Admin > Backup & restore > Restore from a file, and choose this .zip. Photos are re-uploaded to Firebase Storage and the links fixed.',
    'Keep this file somewhere safe: it contains customer details.', ''].join('\n');
}

// The whole ZIP in memory, for emailing. Returns null when it would be bigger than maxBytes.
async function zipToBuffer(data, maxBytes) {
  const { PassThrough } = require('stream');
  const sink = new PassThrough(), chunks = []; let size = 0;
  sink.on('data', (c) => { chunks.push(c); size += c.length; });
  try {
    const info = await writeZip(sink, data, { maxBytes });
    if (size > maxBytes) return null;
    return { buffer: Buffer.concat(chunks), ...info };
  } catch (e) { if (e.tooBig) return null; throw e; }
}

/* ---------------------------------------------------------------- reading a ZIP (restore) */

function openZip(file) {
  return new Promise((resolve, reject) => {
    yauzl.open(file, { lazyEntries: true, autoClose: false }, (err, zip) => {
      if (err) return reject(new Error('That file could not be opened as a backup .zip.'));
      const entries = new Map();
      zip.on('entry', (e) => { entries.set(e.fileName, e); zip.readEntry(); });
      zip.on('error', reject);
      zip.on('end', () => resolve({
        has: (name) => entries.has(name),
        read: (name, max) => new Promise((res, rej) => {
          const e = entries.get(name);
          if (!e) return rej(new Error(`"${name}" is missing from the backup`));
          if (e.uncompressedSize > max) return rej(new Error(`"${name}" is too large`));
          zip.openReadStream(e, (er, stream) => {
            if (er) return rej(er);
            const chunks = []; let got = 0;
            stream.on('data', (c) => { got += c.length; if (got > max) { stream.destroy(); rej(new Error(`"${name}" is too large`)); } else chunks.push(c); });
            stream.on('end', () => res(Buffer.concat(chunks)));
            stream.on('error', rej);
          });
        }),
        close: () => zip.close(),
      }));
      zip.readEntry();
    });
  });
}

module.exports = { collectUrls, rewriteUrls, writeZip, zipToBuffer, openZip, isRemote, MAX_DATA, MAX_PHOTO, IMAGE_COLUMNS };
