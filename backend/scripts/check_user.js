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
function getUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield db_1.pool.connect();
        try {
            // We saw Tenant ID 14 in the logs
            const tenantId = 14;
            // List all users
            const allUsersRes = yield client.query("SELECT id, username, role, tenant_id FROM users");
            console.log("All Users in DB:");
            console.table(allUsersRes.rows);
            // List all Tenants
            const allTenants = yield client.query("SELECT id, name FROM tenants");
            console.log("All Tenants in DB:");
            console.table(allTenants.rows);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            client.release();
            db_1.pool.end();
        }
    });
}
getUser();
