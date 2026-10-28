// Email through a Google Apps Script web app (see docs/email/). The server posts a small JSON event to the
// script and the script sends the emails from your Google account:
//   inquiry / auction_request / newsletter  -> alert to the team (and a "we received it" email to the customer)
//   stage                                    -> an email to the customer when their order moves to a new stage
//
//   APPS_SCRIPT_URL      the web app URL that ends in /exec
//   APPS_SCRIPT_SECRET   a long random text; the same value is saved in the script's properties
//
// Sending never blocks or fails a customer's request: errors are logged and swallowed.
const settings = require('./settings');

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const STAGES = ['Requested', 'Bidding', 'Won', 'LC opened', 'Shipped', 'Arrived', 'Delivered'];

const url = () => (process.env.APPS_SCRIPT_URL || '').trim();
const secret = () => (process.env.APPS_SCRIPT_SECRET || '').trim();
const enabled = () => /^https:\/\/script\.google(usercontent)?\.com\//.test(url()) && secret().length >= 12;
const validEmail = (s) => EMAIL_RE.test(String(s || '').trim());

// Public details the emails use (name, phone, WhatsApp, website address).
async function siteInfo() {
  const o = await settings.overrides();
  const phone = o.phone || process.env.SITE_PHONE || '+94 768 65 65 15';
  const wa = o.whatsapp || (process.env.SITE_WHATSAPP || phone).replace(/[^0-9]/g, '');
  return {
    name: 'Direct Auto', phone, whatsapp: wa, email: o.email || process.env.SITE_EMAIL || '',
    url: (process.env.SITE_URL || '').replace(/\/+$/, ''),
    notifyCustomers: o.notifyCustomers !== false,           // Admin > Site details switch (on by default)
  };
}

// Returns { ok, error?, ... } and never throws.
async function send(event, data) {
  if (!enabled()) return { ok: false, error: 'Email is not connected (set APPS_SCRIPT_URL and APPS_SCRIPT_SECRET).' };
  try {
    const res = await fetch(url(), {
      method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secret(), event, site: await siteInfo(), data }),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let out = null; try { out = JSON.parse(text); } catch (_e) { /* not JSON */ }
    if (!res.ok || !out) throw new Error(out && out.error ? out.error : `The mail script answered with ${res.status}. Check the deployment (Execute as: Me, Who has access: Anyone).`);
    if (!out.ok) throw new Error(out.error || 'The mail script reported an error.');
    return { ok: true, ...out };
  } catch (e) {
    console.error('[mail] "%s" not sent: %s', event, e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { send, enabled, validEmail, STAGES };
