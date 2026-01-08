"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../src/db");
function migrate() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting migration: Adding share_token to invoices...");
        const client = yield db_1.pool.connect();
        try {
            yield client.query("BEGIN");
            // 1. Ensure UUID extension exists
            yield client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
            // 2. Add column if not exists
            yield client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='share_token') THEN
          ALTER TABLE invoices ADD COLUMN share_token UUID DEFAULT uuid_generate_v4();
          CREATE INDEX idx_invoices_share_token ON invoices(share_token);
        END IF;
      END $$;
    `);
            // 3. Backfill existing NULLs (just in case default didn't catch them, though default usually applies to new rows)
            // Actually, adding column with DEFAULT fills existing rows in Postgres? Yes, usually.
            // But let's be safe.
            yield client.query("UPDATE invoices SET share_token = uuid_generate_v4() WHERE share_token IS NULL");
            yield client.query("COMMIT");
            console.log("Migration successful!");
        }
        catch (err) {
            yield client.query("ROLLBACK");
            console.error("Migration failed:", err);
        }
        finally {
            client.release();
            db_1.pool.end();
        }
    });
}
migrate();
