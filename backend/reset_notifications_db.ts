
import { query } from './src/db';
import dotenv from 'dotenv';

dotenv.config();

const resetNotificationsTable = async () => {
    try {
        console.log("Dropping notifications table...");
        await query(`DROP TABLE IF EXISTS notifications CASCADE;`);

        console.log("Creating notifications table...");
        await query(`
            CREATE TABLE notifications (
                id SERIAL PRIMARY KEY,
                tenant_id INTEGER REFERENCES tenants(id) NOT NULL,
                user_id INTEGER REFERENCES users(id), -- Nullable for tenant-wide
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type VARCHAR(50) DEFAULT 'info',
                read BOOLEAN DEFAULT FALSE,
                link VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Add index for performance
        await query(`CREATE INDEX idx_notifications_tenant_user ON notifications(tenant_id, user_id);`);

        console.log("Notifications table reset successfully.");
    } catch (err: any) {
        console.error("Error resetting table:", err);
    }
    process.exit(0);
};

resetNotificationsTable();
