
import { query } from './src/db';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const verifyCols = async () => {
    try {
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'notifications';
        `);

        const output = res.rows.map(r => `${r.column_name}: ${r.data_type}`).join('\n');
        fs.writeFileSync('cols.txt', `Columns for notifications:\n${output}`);
        console.log("Wrote columns to cols.txt");
    } catch (err: any) {
        fs.writeFileSync('cols.txt', `Error: ${err.message}`);
        console.error(err);
    }
    process.exit(0);
};

verifyCols();
