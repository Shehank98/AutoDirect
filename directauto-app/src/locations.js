// Inventory locations shown in "Browse by Inventory Location" and used by the admin form.
// `code` is the ISO country code used for the flag image.
// Staff can add more countries from Admin > Vehicles (stored in the `extraLocations` setting); `merge` adds them to this list.
const BUILTIN = [
  { name: 'Japan',     code: 'jp' },
  { name: 'Korea',     code: 'kr' },
  { name: 'Singapore', code: 'sg' },
  { name: 'Thailand',  code: 'th' },
  { name: 'China',     code: 'cn' },
  { name: 'UK',        code: 'gb' },
  { name: 'UAE',       code: 'ae' },
];

// Flag codes for countries people are likely to add, so they do not have to type a code.
const CODES = {
  australia: 'au', 'new zealand': 'nz', india: 'in', malaysia: 'my', indonesia: 'id', pakistan: 'pk', bangladesh: 'bd', 'sri lanka': 'lk',
  germany: 'de', france: 'fr', italy: 'it', spain: 'es', sweden: 'se', netherlands: 'nl', belgium: 'be', ireland: 'ie', poland: 'pl',
  usa: 'us', 'united states': 'us', america: 'us', canada: 'ca', mexico: 'mx', brazil: 'br', 'south africa': 'za', kenya: 'ke',
  'hong kong': 'hk', taiwan: 'tw', vietnam: 'vn', philippines: 'ph', oman: 'om', qatar: 'qa', 'saudi arabia': 'sa', kuwait: 'kw',
  bahrain: 'bh', turkey: 'tr', russia: 'ru', 'united kingdom': 'gb', england: 'gb', 'south korea': 'kr', 'united arab emirates': 'ae',
  maldives: 'mv', nepal: 'np', mauritius: 'mu', tanzania: 'tz', zambia: 'zm', uganda: 'ug', egypt: 'eg', switzerland: 'ch', austria: 'at',
};

const codeFor = (name) => CODES[String(name).trim().toLowerCase()] || '';

// Built-in list plus the countries staff added. A name already in the built-in list is not repeated.
function merge(extra) {
  const out = BUILTIN.map((l) => ({ ...l }));
  const seen = new Set(out.map((l) => l.name.toLowerCase()));
  for (const x of Array.isArray(extra) ? extra : []) {
    const name = String((x && x.name) || '').trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({ name, code: String((x && x.code) || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 2) || codeFor(name) });
  }
  return out;
}

module.exports = BUILTIN;
module.exports.merge = merge;
module.exports.codeFor = codeFor;
