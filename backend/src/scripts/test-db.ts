import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

// Load env vars from backend root
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

async function testConnection() {
  console.log('Testing connection with:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err: any) {
    console.error('Connection to target DB failed:', err);
    
    if (err.code === '3D000') {
      console.log('Target database does not exist. Attempting to connect to "postgres" database to check credentials...');
      const rootPool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres',
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
      });

      try {
        const rootClient = await rootPool.connect();
        console.log('SUCCESS: Credentials are correct, but database "facturacion_electronica" is missing.');
        console.log('You need to create the database.');
        rootClient.release();
        await rootPool.end();
      } catch (rootErr: any) {
        console.error('FAILED: Could not connect to "postgres" database either. Check your password/user.', rootErr.message);
      }
    }
    process.exit(1);
  }
}

testConnection();
