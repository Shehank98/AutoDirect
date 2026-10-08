// Creates the schema and, if the database is empty, loads sample data.
// Runs automatically on server start (see server.js) and can be run manually: `npm run migrate`.
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

// One-off: make sure the brands / body types shown in "Browse by..." exist, and give the
// brands we ship logos for their image. Runs once (tracked in app_meta) so anything the
// admin later renames or deletes is not re-created on the next boot.
const DEFAULT_BRANDS = ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Suzuki', 'Mitsubishi', 'Daihatsu', 'Subaru',
  'Hino', 'Volkswagen', 'BMW', 'Isuzu', 'Lexus', 'Mercedes-Benz', 'Audi', 'Volvo', 'Land Rover', 'Ford',
  'Peugeot', 'Jeep', 'Citroen', 'Jaguar', 'Hyundai', 'Kia'];
const DEFAULT_TYPES = ['Sedan', 'Coupe', 'Hatchback', 'Station Wagon', 'SUV', 'Pickup', 'Van', 'Mini Van',
  'Wagon', 'Convertible', 'Bus', 'Truck', 'Heavy Equipment'];
const BUNDLED_LOGOS = { toyota: 'toyota', honda: 'honda', mazda: 'mazda', suzuki: 'suzuki',
  'mercedes-benz': 'benz', audi: 'audi', jaguar: 'jaguar' };

async function ensureBrowseDefaults(client) {
  const KEY = 'browse_defaults_v1';
  if ((await client.query('SELECT 1 FROM app_meta WHERE key = $1', [KEY])).rowCount) return;
  for (const name of DEFAULT_BRANDS) {
    await client.query(
      `INSERT INTO vehicle_manufacturer (name) SELECT $1::varchar
        WHERE NOT EXISTS (SELECT 1 FROM vehicle_manufacturer WHERE lower(name) = lower($1))`, [name]);
  }
  for (const name of DEFAULT_TYPES) {
    await client.query(
      `INSERT INTO vehicle_type (name) SELECT $1::varchar
        WHERE NOT EXISTS (SELECT 1 FROM vehicle_type WHERE lower(name) = lower($1))`, [name]);
  }
  for (const [brand, file] of Object.entries(BUNDLED_LOGOS)) {
    await client.query(
      `UPDATE vehicle_manufacturer SET image = $2 WHERE lower(name) = $1 AND (image IS NULL OR image = '')`,
      [brand, `/assets/images/logos/${file}.png`]);
  }
  await client.query('INSERT INTO app_meta (key) VALUES ($1)', [KEY]);
  console.log('[migrate] browse defaults (brands / body types) ensured.');
}

async function migrate() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

  const client = await pool.connect();
  try {
    console.log('[migrate] applying schema...');
    await client.query(schema);

    const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM vehicle');
    if (rows[0].n === 0) {
      console.log('[migrate] empty database — loading sample data...');
      await client.query(seed);
      console.log('[migrate] sample data loaded.');
    } else {
      console.log(`[migrate] database already has ${rows[0].n} vehicles — skipping seed.`);
    }
    await ensureBrowseDefaults(client);
    console.log('[migrate] done.');
  } finally {
    client.release();
  }
}

// Allow both `require()` (from server.js) and direct CLI execution.
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[migrate] failed:', err);
      process.exit(1);
    });
}

module.exports = migrate;
