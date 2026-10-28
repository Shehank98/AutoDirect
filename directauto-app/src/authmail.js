// Account emails (confirm your email, reset your password) sent through our own Google Apps Script mail
// instead of Firebase's default sender, which Gmail often files under spam.
//
// The link points at our own website (/auth-action) so people see the business address, not firebaseapp.com.
// If email is not connected, or anything fails, the caller falls back to Firebase's built-in email so
// sign-up and password reset never stop working.
const { isConfigured, actionLink } = require('./firebase');
const mailer = require('./mailer');

const siteUrl = () => (process.env.SITE_URL || '').replace(/\/+$/, '');

// Returns a link on our own domain when SITE_URL is set; otherwise the Firebase link as it is.
async function link(kind, email) {
  const raw = await actionLink(kind, email, siteUrl() ? siteUrl() + '/login' : undefined);
  if (!siteUrl()) return raw;
  const code = new URL(raw).searchParams.get('oobCode');
  if (!code) return raw;
  return `${siteUrl()}/auth-action?mode=${kind === 'verify' ? 'verifyEmail' : 'resetPassword'}&oobCode=${encodeURIComponent(code)}`;
}

const usable = () => mailer.enabled() && isConfigured();

// Each returns { ok: true } or { ok: false, fallback: true } (the browser then asks Firebase to send its own email).
async function sendVerification(user) {
  if (!usable()) return { ok: false, fallback: true };
  try {
    const r = await mailer.send('verify_email', { email: user.email, name: user.name || '', link: await link('verify', user.email) });
    return r.ok ? { ok: true } : { ok: false, fallback: true };
  } catch (e) { console.error('[authmail] verification email failed:', e.message); return { ok: false, fallback: true }; }
}

async function sendReset(email) {
  if (!usable()) return { ok: false, fallback: true };
  try {
    const r = await mailer.send('password_reset', { email, link: await link('reset', email) });
    return r.ok ? { ok: true } : { ok: false, fallback: true };
  } catch (e) {
    if (/user-not-found|no user record/i.test(`${e.code} ${e.message}`)) return { ok: true };   // never reveal who has an account
    console.error('[authmail] reset email failed:', e.message);
    return { ok: false, fallback: true };
  }
}

module.exports = { sendVerification, sendReset };
