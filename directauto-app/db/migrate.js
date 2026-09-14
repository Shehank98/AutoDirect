// Creates the schema and, if the database is empty, loads sample data.
// Runs automatically on server start (see server.js) and can be run manually: `npm run migrate`.
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

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
