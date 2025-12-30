import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'facturacion_electronica',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

const run = async () => {
    const client = await pool.connect();
    try {
        console.log('Adding supabase_uid to users table...');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS supabase_uid UUID UNIQUE');
        console.log('Done.');
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
};

run();
