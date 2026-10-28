// Sample car photos (public/samples). While USE_SAMPLE_IMAGES is on (the default), every listing shows
// these instead of whatever is stored in the database, so the site looks complete without any image storage.
// Once Firebase Storage is configured this switches off by itself (or set USE_SAMPLE_IMAGES explicitly).
const POOL = [
  { file: 'toyota-corolla-axio.jpg', kind: 'sedan' },
  { file: 'honda-grace.jpg', kind: 'sedan' },
  { file: 'honda-vezel.jpg', kind: 'suv' },
  { file: 'nissan-xtrail-white.jpg', kind: 'suv' },
  { file: 'nissan-xtrail-grey.jpg', kind: 'suv' },
  { file: 'range-rover.jpg', kind: 'suv' },
];
const url = (f) => `/samples/${f}`;
// Explicit USE_SAMPLE_IMAGES wins. Otherwise sample photos are used only until Firebase Storage is set up,
// then the photos staff upload are shown.
const enabled = () => {
  const v = process.env.USE_SAMPLE_IMAGES;
  if (v !== undefined && v !== '') return String(v).toLowerCase() !== 'false';
  return !require('./firebase').isConfigured();
};

// Pick the most fitting sample for a vehicle (by model, then body type), falling back to a stable
// choice based on its id so the same car always gets the same picture.
function primaryIndex(v) {
  const name = `${v.manufacturer_name || ''} ${v.model_name || ''}`.toLowerCase();
  const colour = `${v.color_name || ''}`.toLowerCase();
  const find = (f) => POOL.findIndex((p) => p.file === f);
  if (/corolla|axio|premio|allion/.test(name)) return find('toyota-corolla-axio.jpg');
  if (/grace/.test(name)) return find('honda-grace.jpg');
  if (/vezel/.test(name)) return find('honda-vezel.jpg');
  if (/x-trail|xtrail/.test(name)) return find(/grey|gray|black|gun/.test(colour) ? 'nissan-xtrail-grey.jpg' : 'nissan-xtrail-white.jpg');
  if (/land rover|range rover|evoque|discovery/.test(name)) return find('range-rover.jpg');
  const type = `${v.type_name || ''}`.toLowerCase();
  const kind = /suv|jeep|crossover/.test(type) ? 'suv' : /sedan|coupe|hatch|wagon/.test(type) ? 'sedan' : null;
  const group = kind ? POOL.map((p, i) => (p.kind === kind ? i : -1)).filter((i) => i >= 0) : POOL.map((_p, i) => i);
  return group[(Number(v.id) || 0) % group.length];
}

// Three photos per vehicle so the gallery has something to page through.
function sampleImages(v) {
  const i = primaryIndex(v);
  return [0, 1, 2].map((k) => url(POOL[(i + k * 2) % POOL.length].file));
}

module.exports = { enabled, sampleImages };
