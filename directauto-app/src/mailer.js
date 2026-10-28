// Email alerts for the sales team (the old site sent these too): a message arrives on the website ->
// an email goes to NOTIFY_TO. Configure with SMTP_* variables; with none set, alerts are simply off.
//
//   SMTP_HOST, SMTP_PORT (587 default), SMTP_SECURE (true for port 465), SMTP_USER, SMTP_PASS
//   MAIL_FROM   "Direct Auto <alerts@yourdomain.lk>"   (defaults to SMTP_USER)
//   NOTIFY_TO   comma separated recipients (required), NOTIFY_CC, NOTIFY_BCC
//
// Sending never blocks or fails a customer's request: errors are logged and swallowed.
const nodemailer = require('nodemailer');

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const list = (s) => String(s || '').split(',').map((x) => x.trim()).filter((x) => EMAIL_RE.test(x));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const to = () => list(process.env.NOTIFY_TO);
const enabled = () => !!process.env.SMTP_HOST && to().length > 0;

let transport = null;
let transportKey = '';
function getTransport() {
  const key = [process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_SECURE, process.env.SMTP_USER, process.env.SMTP_PASS].join('|');
  if (transport && key === transportKey) return transport;
  const port = Number(process.env.SMTP_PORT) || 587;
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' } : undefined,
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 15000,
  });
  transportKey = key;
  return transport;
}

// fields: [[label, value], ...]. Returns { ok, error? } and never throws.
async function notify(subject, fields, { replyTo } = {}) {
  if (!enabled()) return { ok: false, error: 'Email alerts are not configured (set SMTP_HOST and NOTIFY_TO).' };
  const rows = fields.filter((f) => f[1] !== undefined && f[1] !== null && String(f[1]).trim() !== '');
  const adminUrl = process.env.SITE_URL ? `${process.env.SITE_URL.replace(/\/+$/, '')}/admin` : '';
  const html = `<div style="font:14px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#14171a;max-width:620px">
  <h2 style="margin:0 0 12px;font-size:18px">${esc(subject)}</h2>
  <table style="border-collapse:collapse;width:100%">${rows.map((r) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#5a5f66;vertical-align:top;white-space:nowrap">${esc(r[0])}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(r[1])}</td></tr>`).join('')}</table>
  ${adminUrl ? `<p style="margin-top:18px"><a href="${esc(adminUrl)}">Open the admin panel</a></p>` : ''}
  <p style="color:#857e70;font-size:12px;margin-top:18px">Sent automatically by the Direct Auto website.</p></div>`;
  const text = rows.map((r) => `${r[0]}: ${r[1]}`).join('\n') + (adminUrl ? `\n\nAdmin: ${adminUrl}` : '');
  try {
    await getTransport().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: to(), cc: list(process.env.NOTIFY_CC), bcc: list(process.env.NOTIFY_BCC),
      replyTo: replyTo && EMAIL_RE.test(replyTo) ? replyTo : undefined,   // staff can just hit Reply
      subject: `[Direct Auto] ${subject}`.replace(/[\r\n]+/g, ' '), text, html,
    });
    return { ok: true };
  } catch (e) {
    console.error('[mail] could not send "%s": %s', subject, e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { notify, enabled, recipients: to };
