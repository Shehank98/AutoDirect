// PostgreSQL connection pool.
// Railway's Postgres plugin injects DATABASE_URL automatically. Locally you can set
// DATABASE_URL in a .env file (see .env.example).
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    '[db] DATABASE_URL is not set. On Railway, add a PostgreSQL service and reference ' +
    'its DATABASE_URL variable on this service. Locally, set it in .env.'
  );
}

// Railway's internal Postgres connection does not need SSL; its public proxy does.
// Enable SSL only when explicitly asked (PGSSL=true) or when using a non-internal host.
const useSsl =
  String(process.env.PGSSL).toLowerCase() === 'true' ||
  (connectionString && !connectionString.includes('.railway.internal') && /proxy\.rlwy\.net|amazonaws|render\.com/.test(connectionString));

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected idle client error:', err.message);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
