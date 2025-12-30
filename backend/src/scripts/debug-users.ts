
import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function listUsers() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, username, tenant_id FROM users');
    console.log('Users in DB:', res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    client.release();
    await pool.end();
  }
}

listUsers();
