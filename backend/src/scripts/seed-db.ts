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

async function seed() {
  try {
    const client = await pool.connect();
    console.log('Connected to database...');

    // Check if client exists
    const clientRes = await client.query('SELECT * FROM clients WHERE id = 1');
    if (clientRes.rows.length === 0) {
      console.log('Seeding Client...');
      await client.query(`
        INSERT INTO clients (id, name, rnc_ci, email, type)
        VALUES (1, 'Cliente Generico', '101010101', 'cliente@example.com', 'juridico')
      `);
    } else {
      console.log('Client already exists.');
    }

    // Check if product exists
    const productRes = await client.query('SELECT * FROM products WHERE id = 1');
    if (productRes.rows.length === 0) {
      console.log('Seeding Product...');
      await client.query(`
        INSERT INTO products (id, description, unit_price, tax_rate)
        VALUES (1, 'Servicio de Consultoria', 1000.00, 18.00)
      `);
    } else {
      console.log('Product already exists.');
    }

    console.log('Database seeded successfully!');
    client.release();
    await pool.end();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
