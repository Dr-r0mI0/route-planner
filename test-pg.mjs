import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({
  host: process.env.PGHOST || '172.19.0.2',
  port: 5432,
  database: 'routplanner',
  user: 'admin',
  password: 'rout2024secure',
});
pool.query('SELECT NOW()')
  .then(r => console.log('✓ PostgreSQL connected:', r.rows[0].now))
  .catch(e => console.error('✗ Error:', e.message));