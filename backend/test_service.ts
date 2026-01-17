
import { getNotifications, getUnreadCount } from './src/services/notificationService';
import { query } from './src/db';
import dotenv from 'dotenv';

dotenv.config();

const runTest = async () => {
    try {
        console.log("Testing Notification Service...");

        // Use a known tenant/user or fetch one
        const userRes = await query('SELECT id, tenant_id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log("No users found to test.");
            return;
        }

        const { id: userId, tenant_id: tenantId } = userRes.rows[0];
        console.log(`Testing with Tenant: ${tenantId}, User: ${userId}`);

        console.log("1. Testing getNotifications...");
        const notifications = await getNotifications(tenantId, userId);
        console.log(`- Success! Got ${notifications.length} notifications.`);
        // console.log(JSON.stringify(notifications, null, 2));

        console.log("2. Testing getUnreadCount...");
        const count = await getUnreadCount(tenantId, userId);
        console.log(`- Success! Unread count: ${count}`);

    } catch (err) {
        console.error("TEST FAILED:", err);
    }
    process.exit(0);
};

runTest();
