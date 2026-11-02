// Putting a photo into Firebase Storage from the server (used when a backup is restored).
// The admin's normal upload lives in routes/admin.js; this makes links in the same format.
const crypto = require('crypto');
const firebase = require('./firebase');

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif' };

function configured() {
  try { return firebase.isConfigured() && !!firebase.bucket().name; } catch (_e) { return false; }
}

// Saves a buffer and returns its public download link.
async function uploadBuffer(buffer, contentType, folder, nameHint) {
  const b = firebase.bucket();
  const base = String(nameHint || 'photo').replace(/\.[A-Za-z0-9]+$/, '').replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 40) || 'photo';
  const objectName = `${folder}/${Date.now()}-${crypto.randomBytes(3).toString('hex')}-${base}.${EXT[contentType] || 'jpg'}`;
  const token = crypto.randomUUID();
  await b.file(objectName).save(buffer, { contentType, metadata: { metadata: { firebaseStorageDownloadTokens: token } } });
  return `https://firebasestorage.googleapis.com/v0/b/${b.name}/o/${encodeURIComponent(objectName)}?alt=media&token=${token}`;
}

module.exports = { configured, uploadBuffer, EXT };
