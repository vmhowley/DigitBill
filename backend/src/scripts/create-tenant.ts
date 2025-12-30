import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars to get the secret, if needed locally, though we act as an external client here
dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_URL = 'http://localhost:3000/api/admin/tenants';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'SuperSecretKey123';

const createTenant = async () => {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npm run create-tenant <name> <admin_email> [rnc]');
    console.log('Example: npm run create-tenant "Talleres Pepe" "pepe@test.com" "101010101"');
    process.exit(1);
  }

  const [name, admin_email, rnc] = args;

  console.log(`Creating tenant: ${name} (${rnc || 'No RNC'}) with admin: ${admin_email}`);

  try {
    const response = await axios.post(API_URL, {
      name,
      admin_email,
      rnc: rnc || null
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET
      }
    });

    console.log('✅ Tenant Created Successfully!');
    console.dir(response.data, { depth: null });

  } catch (error: any) {
    console.error('❌ Error creating tenant:');
    if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Data:', error.response.data);
    } else {
        console.error(error.message);
    }
    process.exit(1);
  }
};

createTenant();
