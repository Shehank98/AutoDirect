// Firebase Admin SDK — used to (1) verify Firebase Auth ID tokens sent by the browser,
// and (2) upload car images to Firebase Storage from the admin panel.
//
// It initialises lazily and degrades gracefully: if no service-account credentials are
// configured yet, auth-protected routes return 503 but the public buyer-facing site still
// works. Configure it by setting FIREBASE_SERVICE_ACCOUNT (the full service-account JSON as
// a single-line string) and FIREBASE_STORAGE_BUCKET in the Railway variables.
let admin = null;
let initError = null;

function init() {
  if (admin || initError) return admin;
  try {
    const sdk = require('firebase-admin');
    if (!sdk.apps.length) {
      const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!raw) {
        initError = new Error('FIREBASE_SERVICE_ACCOUNT is not set');
        console.warn('[firebase] not configured — auth & image upload are disabled until FIREBASE_SERVICE_ACCOUNT is set.');
        return null;
      }
      const serviceAccount = JSON.parse(raw);
      sdk.initializeApp({
        credential: sdk.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
      });
      console.log('[firebase] initialised for project:', serviceAccount.project_id);
    }
    admin = sdk;
  } catch (err) {
    initError = err;
    console.error('[firebase] initialisation failed:', err.message);
  }
  return admin;
}

function isConfigured() {
  return !!init();
}

async function verifyIdToken(idToken) {
  const sdk = init();
  if (!sdk) throw new Error('Firebase is not configured on the server');
  return sdk.auth().verifyIdToken(idToken);
}

function bucket() {
  const sdk = init();
  if (!sdk) throw new Error('Firebase is not configured on the server');
  return sdk.storage().bucket();
}

module.exports = { init, isConfigured, verifyIdToken, bucket };
