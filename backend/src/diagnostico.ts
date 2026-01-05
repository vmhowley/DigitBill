import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

console.log('--- DIAGNÓSTICO DE VARIABLES DE ENTORNO ---');
console.log('CWD:', process.env.PWD || process.cwd());
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'CONFIGURADA (empieza con ' + process.env.STRIPE_SECRET_KEY.substring(0, 7) + ')' : 'NO ENCONTRADA');
console.log('STRIPE_PRICE_ENTREPRENEUR:', process.env.STRIPE_PRICE_ENTREPRENEUR || 'NO ENCONTRADA');
console.log('STRIPE_PRICE_PYME:', process.env.STRIPE_PRICE_PYME || 'NO ENCONTRADA');
console.log('STRIPE_PRICE_ENTERPRISE:', process.env.STRIPE_PRICE_ENTERPRISE || 'NO ENCONTRADA');
console.log('-------------------------------------------');
