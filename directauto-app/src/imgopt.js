// Photo speed. Uploaded car photos are often 3-8 MB straight from a phone; the site shows them at 300-1200 px.
//   optimize()   shrinks a photo when it is uploaded (admin) so new photos are light from day one.
//   resizeRoute  /api/img?u=<photo link>&w=<width> serves a smaller copy of any photo already stored (cached on
//                disk and by the browser), so old photos get light too. Only our own storage links are accepted.
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const sharp = require('sharp');

const WIDTHS = [240, 480, 800, 1200, 1600, 2000];
const MAX_SOURCE = 40 * 1024 * 1024;
const CACHE_DIR = path.join(os.tmpdir(), 'directauto-img');
try { fs.mkdirSync(CACHE_DIR, { recursive: true }); } catch (_e) { /* the cache is optional */ }

// Shrinks JPG/PNG/WebP to at most 2000 px wide and re-saves as WebP. GIF and SVG are left alone.
async function optimize(buffer, mimetype) {
  if (!/^image\/(jpeg|png|webp)$/.test(mimetype)) return { buffer, mimetype, ext: null };
  try {
    const out = await sharp(buffer, { limitInputPixels: 80e6 }).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    return out.length < buffer.length ? { buffer: out, mimetype: 'image/webp', ext: 'webp' } : { buffer, mimetype, ext: null };
  } catch (_e) { return { buffer, mimetype, ext: null }; }
}

function allowedSource(u) {
  try {
    const x = new URL(u);
    return x.protocol === 'https:' && (x.hostname === 'firebasestorage.googleapis.com' || x.hostname === 'storage.googleapis.com');
  } catch (_e) { return false; }
}

const inflight = new Map();
async function build(url, w, file) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'error' });
  if (!res.ok) throw Object.assign(new Error('source ' + res.status), { status: 404 });
  const len = Number(res.headers.get('content-length') || 0);
  if (len > MAX_SOURCE) throw Object.assign(new Error('too large'), { status: 413 });
  const input = Buffer.from(await res.arrayBuffer());
  if (input.length > MAX_SOURCE) throw Object.assign(new Error('too large'), { status: 413 });
  const out = await sharp(input, { limitInputPixels: 80e6 }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
  fs.writeFile(file, out, () => {});
  return out;
}

async function resizeRoute(req, res) {
  const url = String(req.query.u || '');
  if (!allowedSource(url)) return res.status(400).json({ error: 'Not a photo from this site.' });
  const want = Number(req.query.w) || 800;
  const w = WIDTHS.find((x) => x >= want) || WIDTHS[WIDTHS.length - 1];
  const key = crypto.createHash('sha1').update(url + '|' + w).digest('hex');
  const file = path.join(CACHE_DIR, key + '.webp');
  res.set({ 'Cache-Control': 'public, max-age=31536000, immutable', 'Content-Type': 'image/webp' });
  try {
    if (fs.existsSync(file)) return res.sendFile(file);
    if (!inflight.has(key)) inflight.set(key, build(url, w, file).finally(() => inflight.delete(key)));
    res.send(await inflight.get(key));
  } catch (e) {
    // Could not shrink it: send the browser to the original so the photo still shows.
    res.set('Cache-Control', 'no-store').redirect(302, url);
  }
}

module.exports = { optimize, resizeRoute };
