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
  ssl: { rejectUnauthorized: false }
});

async function checkTenants() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, name, plan, plan_type FROM tenants');
    console.log('--- ESTADO DE TENANTS ---');
    console.table(res.rows);
    console.log('-------------------------');
  } catch (e: any) {
    console.error('Error:', e.message);
    if (e.message.includes('plan_type')) {
        console.log('La columna plan_type no existe.');
        const res2 = await client.query('SELECT id, name, plan FROM tenants');
        console.table(res2.rows);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

checkTenants();
