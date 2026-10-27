// Search-engine and link-preview support for the single-page app:
//   /robots.txt, /sitemap.xml, and per-page <title>, description, Open Graph / Twitter tags and JSON-LD
//   injected into the app shell on the server (so Google, WhatsApp and Facebook see them without running JavaScript).
const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'public', 'index.html');
let template = null;
const shell = () => (template = template || fs.readFileSync(TEMPLATE_PATH, 'utf8'));

const NAME = 'AutoDirect';
const DEFAULT_DESC = 'Browse imported cars in stock or let AutoDirect bid for your exact car at Japanese auctions, with the original auction sheet translated before every bid.';
const PAGES = {
  '/': ['Japanese auction car imports for Sri Lanka', DEFAULT_DESC],
  '/our-stock': ['Our stock', 'Imported cars in stock in Sri Lanka. Filter by brand, body type, price, year and inventory location.'],
  '/live-auction': ['Ex Stock', 'Browse Ex Stock cars from Japanese auctions and let us bid for you, with the auction sheet translated before every bid.'],
  '/request-a-bid': ['Request a bid', 'Tell us the car, year and budget and we shortlist matching lots at this week\'s Japanese auctions.'],
  '/how-to-buy': ['How to buy', 'From auction floor to your driveway: the steps, timelines and documents for importing a car from Japan.'],
  '/how-to-read-auction-sheet': ['How to read an auction sheet', 'Decode Japanese auction sheet grades and damage codes in a minute.'],
  '/vocabulary': ['Import vocabulary', 'FOB, CIF, LC and other car import terms explained in plain English.'],
  '/about-us': ['About us', 'AutoDirect imports quality vehicles from Japan, Australia and the UK with honest pricing and no hidden fees.'],
  '/contact-us': ['Contact us', 'Call, WhatsApp or visit our Malabe showroom and Colombo 07 office.'],
  '/compare': ['Compare vehicles', 'Compare up to four imported cars side by side.'],
};

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const baseUrl = (req) => (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
const money = (n) => (n > 0 ? `LKR ${Math.round(n).toLocaleString('en-US')}` : 'Price on request');
const carTitle = (v) => [v.year, v.make, v.model].filter(Boolean).join(' ');

// Returns { html, status } for a request to a single-page-app route.
function render(req, catalog) {
  const base = baseUrl(req);
  const pathname = req.path.replace(/\/+$/, '') || '/';
  let title, desc, image = `${base}/samples/toyota-corolla-axio.jpg`, type = 'website', status = 200, ld = null;

  const m = /^\/our-stock\/([^/]+)$/.exec(pathname);
  if (m) {
    let seo; try { seo = decodeURIComponent(m[1]); } catch (_e) { seo = ''; }
    const v = catalog && catalog.vehicles.find((x) => x.seo === seo);
    if (v) {
      title = `${carTitle(v)} ${v.grade || ''}`.trim();
      const specs = [v.mileage ? `${v.mileage.toLocaleString('en-US')} km` : '', v.fuel, v.trans, v.auctionGrade ? `auction grade ${v.auctionGrade}` : ''].filter(Boolean).join(', ');
      desc = `${title}. ${money(v.price)}.${specs ? ` ${specs}.` : ''} Imported from Japan to Sri Lanka by ${NAME}.`;
      if (v.img) image = /^https?:/.test(v.img) ? v.img : base + v.img;
      type = 'product';
      ld = { '@context': 'https://schema.org', '@type': 'Car', name: title, brand: { '@type': 'Brand', name: v.make }, model: v.model, vehicleModelDate: v.year ? String(v.year) : undefined,
        mileageFromOdometer: v.mileage ? { '@type': 'QuantitativeValue', value: v.mileage, unitCode: 'KMT' } : undefined, fuelType: v.fuel || undefined, vehicleTransmission: v.trans || undefined,
        color: v.color || undefined, vehicleIdentificationNumber: v.chassis || undefined, image,
        offers: v.price > 0 ? { '@type': 'Offer', price: v.price, priceCurrency: 'LKR', availability: v.status === 'Sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock', url: `${base}${pathname}` } : undefined };
    } else if (catalog) {
      status = 404; title = 'Vehicle not found'; desc = DEFAULT_DESC;
    }
  }
  if (!title) {
    const p = PAGES[pathname];
    if (p) { [title, desc] = p; } else if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/my-account') || pathname.startsWith('/admin')) { title = pathname.startsWith('/admin') ? 'Admin' : 'My account'; desc = DEFAULT_DESC; }
    else { status = 404; title = 'Page not found'; desc = DEFAULT_DESC; }
  }
  const fullTitle = pathname === '/' ? `${NAME} | ${title}` : `${title} | ${NAME}`;
  const url = `${base}${pathname === '/' ? '/' : pathname}`;
  const noindex = /^\/(admin|login|register|my-account)/.test(pathname) || status === 404;

  const tags = [
    `<link rel="canonical" href="${esc(url)}">`,
    noindex ? '<meta name="robots" content="noindex,nofollow">' : '',
    `<meta property="og:site_name" content="${NAME}">`, `<meta property="og:type" content="${type}">`,
    `<meta property="og:title" content="${esc(fullTitle)}">`, `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${esc(url)}">`, `<meta property="og:image" content="${esc(image)}">`,
    '<meta name="twitter:card" content="summary_large_image">', `<meta name="twitter:title" content="${esc(fullTitle)}">`,
    `<meta name="twitter:description" content="${esc(desc)}">`, `<meta name="twitter:image" content="${esc(image)}">`,
    ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n  ');

  let html = shell()
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace('</head>', `  ${tags}\n</head>`);
  return { html, status };
}

function robots(req) {
  return ['User-agent: *', 'Disallow: /admin', 'Disallow: /api/', 'Disallow: /my-account', '', `Sitemap: ${baseUrl(req)}/sitemap.xml`, ''].join('\n');
}

function sitemap(req, catalog) {
  const base = baseUrl(req);
  const urls = [];
  for (const p of Object.keys(PAGES)) if (p !== '/compare') urls.push({ loc: `${base}${p === '/' ? '/' : p}`, freq: p === '/our-stock' ? 'daily' : 'monthly', pri: p === '/' ? '1.0' : p === '/our-stock' ? '0.9' : '0.6' });
  for (const v of (catalog && catalog.vehicles) || []) {
    urls.push({ loc: `${base}/our-stock/${encodeURIComponent(v.seo)}`, freq: 'weekly', pri: '0.8', mod: v.added ? new Date(v.added).toISOString().slice(0, 10) : '' });
  }
  const body = urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.mod ? `<lastmod>${u.mod}</lastmod>` : ''}<changefreq>${u.freq}</changefreq><priority>${u.pri}</priority></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

module.exports = { render, robots, sitemap };
