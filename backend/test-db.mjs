import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'pokerkings',
  user: 'postgres',
  password: 'password',
  ssl: false
});

try {
  await client.connect();
  console.log('✅ CONEXIÓN SQL DIRECTA OK');
  const res = await client.query('SELECT version()');
  console.log('PostgreSQL version:', res.rows[0].version);
  await client.end();
} catch (err) {
  console.error('❌ ERROR:', err.message);
  console.error('Code:', err.code);
}
