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
  ssl: {
    rejectUnauthorized: false
  }
});

async function clean() {
  try {
    const client = await pool.connect();
    console.log('Connected to database...');

    console.log('Cleaning database...');
    // Truncate tables in order to avoid foreign key constraints issues
    await client.query('TRUNCATE TABLE invoice_items, invoice_logs, invoices, clients, products RESTART IDENTITY CASCADE');

    console.log('Database cleaned successfully!');
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error cleaning database:', err);
    process.exit(1);
  }
}

clean();
