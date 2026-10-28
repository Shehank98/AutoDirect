/**
 * Direct Auto mail service (Google Apps Script web app).
 *
 * The website posts an event here and this script sends the emails from your Google account:
 *   inquiry, auction_request   -> an email to the team, and a "we received it" email to the customer
 *   newsletter                 -> an email to the team
 *   stage                      -> an email to the customer when their order moves to a new stage
 *   verify_email               -> "Confirm your email" link, sent from your address (not Firebase's)
 *   password_reset             -> "Reset your password" link, sent from your address
 *   test                       -> a test email to the team
 *
 * Setup steps are in SETUP.md. Script properties needed (Project settings > Script properties):
 *   SECRET        a long random text (the same value goes into APPS_SCRIPT_SECRET on the server)
 *   ADMIN_EMAILS  who gets the team emails, comma separated
 */

var BRAND = '#0e4f45';                       // button and accents
var REPLY_TIME = 'within 2 working hours';   // shown in the customer receipt

/* ------------------------------------------------------------------ entry points */

function doGet() {
  return json_({ ok: true, service: 'Direct Auto mail' });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('SECRET');
    if (!secret || body.secret !== secret) return json_({ ok: false, error: 'Wrong secret. Check SECRET in the script properties.' });

    var site = body.site || {};
    var d = body.data || {};
    var team = list_(props.getProperty('ADMIN_EMAILS'));
    var sent = [];

    if (body.event === 'inquiry') {
      sent = sent.concat(toTeam_(team, site, {
        subject: 'New inquiry ' + d.ref + (d.car ? ': ' + d.car : ''),
        title: 'New ' + (d.kind || 'inquiry').toLowerCase(),
        rows: [['Reference', d.ref], ['Type', d.kind], ['Name', d.name], ['Mobile', d.phone], ['Email', d.email], ['Car', d.car], ['Message', d.message]],
        replyTo: d.email
      }));
      sent = sent.concat(receipt_(site, d, {
        subject: 'We received your message (' + d.ref + ')',
        intro: 'Thanks for getting in touch' + (d.car ? ' about the ' + d.car : '') + '. We will contact you ' + REPLY_TIME + '.',
        rows: [['Reference', d.ref], ['Car', d.car], ['Your mobile', d.phone], ['Your message', clip_(d.message, 400)]]
      }));
    } else if (body.event === 'auction_request') {
      sent = sent.concat(toTeam_(team, site, {
        subject: 'New auction request ' + d.ref + ': ' + d.car,
        title: 'New auction request',
        rows: [['Reference', d.ref], ['Name', d.name], ['Mobile', d.phone], ['Email', d.email], ['Car', d.car], ['Years', d.years],
               ['Chassis code', d.chassis], ['Budget (LKR)', d.budget], ['Max mileage (km)', d.maxKm], ['Minimum grade', d.grade],
               ['Colours', d.colours], ['Notes', d.notes]],
        replyTo: d.email
      }));
      sent = sent.concat(receipt_(site, d, {
        subject: 'We received your auction request (' + d.ref + ')',
        intro: 'We will look for matching cars at this week’s Japanese auctions and send you the auction sheets before we bid. We will contact you ' + REPLY_TIME + '.',
        rows: [['Reference', d.ref], ['Car', d.car], ['Years', d.years], ['Budget (LKR)', d.budget], ['Your mobile', d.phone]]
      }));
    } else if (body.event === 'newsletter') {
      sent = sent.concat(toTeam_(team, site, {
        subject: 'New newsletter subscriber',
        title: 'New newsletter subscriber',
        rows: [['Email', d.email], ['Name', d.name]]
      }));
    } else if (body.event === 'stage') {
      sent = sent.concat(stage_(site, d));
    } else if (body.event === 'verify_email') {
      // Account emails are always sent, even when "Emails to customers" is switched off in the admin.
      sent = sent.concat(account_(site, d, {
        subject: 'Confirm your email for Direct Auto',
        title: 'Confirm your email',
        intro: 'Hi ' + firstName_(d.name) + ', tap the button to confirm your email address. It takes a few seconds.',
        label: 'Confirm email',
        footnote: 'If you did not create an account with Direct Auto, you can ignore this email.'
      }));
    } else if (body.event === 'password_reset') {
      sent = sent.concat(account_(site, d, {
        subject: 'Reset your Direct Auto password',
        title: 'Reset your password',
        intro: 'We received a request to reset the password for your Direct Auto account. Tap the button to choose a new one.',
        label: 'Choose a new password',
        footnote: 'If you did not ask for this, you can ignore this email. Your password will stay the same.'
      }));
    } else if (body.event === 'test') {
      sent = sent.concat(toTeam_(team, site, {
        subject: 'Direct Auto email test',
        title: 'Email is working',
        intro: 'This is a test sent from the admin' + (d.by ? ' by ' + d.by : '') + '. New inquiries and auction requests will arrive at this address.',
        rows: []
      }));
    } else {
      return json_({ ok: false, error: 'Unknown event: ' + body.event });
    }
    return json_({ ok: true, to: sent });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

/* ------------------------------------------------------------------ the emails */

// Email to the team. Reply goes straight to the customer when they left an email address.
function toTeam_(team, site, o) {
  if (!team.length) throw new Error('ADMIN_EMAILS is empty in the script properties.');
  var button = site.url ? { label: 'Open admin', url: site.url + '/admin' } : null;
  send_(team, o.subject, page_(site, { title: o.title, intro: o.intro, rows: o.rows, button: button, audience: 'team' }), o.replyTo);
  return team;
}

// "We received it" email to the customer (only when they gave an email address and the admin allows it).
function receipt_(site, d, o) {
  if (!d.email || site.notifyCustomers === false) return [];
  var first = firstName_(d.name);
  send_([d.email], o.subject, page_(site, {
    title: 'We received your ' + (o.subject.indexOf('auction') > -1 ? 'request' : 'message'),
    intro: 'Hi ' + first + ', ' + o.intro.charAt(0).toLowerCase() + o.intro.slice(1),
    rows: o.rows, button: whatsapp_(site), audience: 'customer'
  }), site.email);
  return [d.email];
}

// Confirm-email and password-reset emails: one button, plus the plain link in case the button does not work.
function account_(site, d, o) {
  if (!d.email || !d.link) throw new Error('Missing email or link.');
  if (!/^https?:\/\//.test(d.link)) throw new Error('The link must be a web address.');   // blocks odd schemes such as javascript:
  send_([d.email], o.subject, page_(site, {
    title: o.title, intro: o.intro, rows: [], button: { label: o.label, url: d.link },
    note: 'The link can only be used once. If the button does not work, copy this address into your browser:<br><span style="word-break:break-all;color:#3b4047">' + esc_(d.link) + '</span><br><br>' + esc_(o.footnote),
    audience: 'customer'
  }), site.email);
  return [d.email];
}

// Order moved to a new stage.
var STAGE_TEXT = [
  'We have your request and will start looking for matching cars.',
  'We are bidding on your car at the Japanese auction.',
  'We won the car at the auction. We will send you the invoice and the LC details.',
  'Your LC is open. We are arranging export and shipping.',
  'The car has left Japan and is on its way to Colombo.',
  'The car has arrived in Colombo. Customs clearance is next.',
  'Your car is ready and handed over. Thank you for choosing Direct Auto.'
];

function stage_(site, d) {
  if (!d.email || site.notifyCustomers === false) return [];
  var i = Math.max(0, Math.min(6, Number(d.stage) || 0));
  send_([d.email], 'Order update: ' + d.stageName + ' (' + d.ref + ')', page_(site, {
    title: d.stageName,
    intro: 'Hi ' + firstName_(d.name) + ', ' + STAGE_TEXT[i].charAt(0).toLowerCase() + STAGE_TEXT[i].slice(1),
    stage: i,
    rows: [['Reference', d.ref], ['Car', d.car], ['Expected in Colombo', d.eta ? date_(d.eta) : ''], ['Note from us', d.note]],
    button: whatsapp_(site), audience: 'customer'
  }), site.email);
  return [d.email];
}

/* ------------------------------------------------------------------ layout */

var STEPS = ['Requested', 'Bidding', 'Won', 'LC opened', 'Shipped', 'Arrived', 'Delivered'];

// o: { title, intro, rows: [[label, value]], stage (0-6), button: {label, url} }
function page_(site, o) {
  var rows = (o.rows || []).filter(function (r) { return r[1] !== undefined && r[1] !== null && String(r[1]).trim() !== ''; });
  var h = '';
  h += '<div style="background:#f4f4f1;padding:24px 12px;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#14171a">';
  h += '<div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e6e3da;border-radius:12px;overflow:hidden">';
  h += '<div style="height:4px;background:' + BRAND + '"></div>';
  h += '<div style="padding:24px 28px 8px"><span style="font-size:15px;font-weight:700;letter-spacing:-0.01em">Direct <span style="color:' + BRAND + '">Auto</span></span></div>';
  h += '<div style="padding:8px 28px 24px">';
  h += '<h1 style="margin:0 0 10px;font-size:22px;line-height:1.25;font-weight:700">' + esc_(o.title) + '</h1>';
  if (o.intro) h += '<p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#3b4047">' + esc_(o.intro) + '</p>';
  if (typeof o.stage === 'number') h += tracker_(o.stage);
  if (rows.length) {
    h += '<table role="presentation" style="width:100%;border-collapse:collapse;margin:4px 0 18px">';
    rows.forEach(function (r) {
      h += '<tr><td style="padding:9px 14px 9px 0;border-top:1px solid #eeebe3;color:#6b6f76;font-size:13px;width:34%;vertical-align:top">' + esc_(r[0]) + '</td>' +
           '<td style="padding:9px 0;border-top:1px solid #eeebe3;font-size:14px;line-height:1.45;vertical-align:top;white-space:pre-wrap">' + value_(r[0], r[1]) + '</td></tr>';
    });
    h += '</table>';
  }
  if (o.button) h += '<a href="' + esc_(o.button.url) + '" style="display:inline-block;background:' + BRAND + ';color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px">' + esc_(o.button.label) + '</a>';
  if (o.note) h += '<p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#6b6f76">' + o.note + '</p>';
  h += '</div>';
  h += '<div style="padding:16px 28px;background:#faf9f6;border-top:1px solid #eeebe3;font-size:12px;line-height:1.6;color:#6b6f76">' +
       (o.audience === 'customer' ? 'Questions? Call ' + esc_(site.phone || '') + (site.whatsapp ? ' or message us on WhatsApp.' : '.') + '<br>' : '') +
       'Direct Auto' + (site.url ? ' &middot; <a href="' + esc_(site.url) + '" style="color:#6b6f76">' + esc_(site.url.replace(/^https?:\/\//, '')) + '</a>' : '') + '</div>';
  h += '</div></div>';
  return h;
}

// Seven small bars, filled up to the current stage.
function tracker_(i) {
  var cells = STEPS.map(function (s, k) {
    return '<td style="padding:0 2px"><div style="height:6px;border-radius:3px;background:' + (k <= i ? BRAND : '#e6e3da') + '"></div></td>';
  }).join('');
  return '<table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 6px"><tr>' + cells + '</tr></table>' +
         '<p style="margin:0 0 16px;font-size:12px;color:#6b6f76">Step ' + (i + 1) + ' of 7: ' + STEPS[i] + '</p>';
}

/* ------------------------------------------------------------------ helpers */

function send_(to, subject, html, replyTo) {
  var opts = { to: to.join(','), subject: subject, htmlBody: html, body: stripHtml_(html), name: 'Direct Auto' };
  if (replyTo && /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(replyTo)) opts.replyTo = replyTo;
  MailApp.sendEmail(opts);
}

function whatsapp_(site) {
  return site.whatsapp ? { label: 'Message us on WhatsApp', url: 'https://wa.me/' + String(site.whatsapp).replace(/[^0-9]/g, '') } : null;
}

// Phone numbers and email addresses become tap-to-call / tap-to-mail links.
function value_(label, v) {
  var s = esc_(v);
  if (label === 'Mobile' || label === 'Your mobile') return '<a href="tel:' + esc_(String(v).replace(/[^+0-9]/g, '')) + '" style="color:#14171a">' + s + '</a>';
  if (label === 'Email') return '<a href="mailto:' + s + '" style="color:#14171a">' + s + '</a>';
  return s;
}

function esc_(s) {
  return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
}
function stripHtml_(h) { return h.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<\/(tr|p|h1|div)>/g, '\n').replace(/<[^>]+>/g, ' ').replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim(); }
function clip_(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n) + '...' : s; }
function firstName_(n) { return String(n || 'there').trim().split(/\s+/)[0] || 'there'; }
function list_(s) { return String(s || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean); }
function date_(iso) { var p = String(iso).split('-'); var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return p.length === 3 ? Number(p[2]) + ' ' + m[Number(p[1]) - 1] + ' ' + p[0] : iso; }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
