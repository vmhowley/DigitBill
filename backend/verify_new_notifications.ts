
import { createNotification, getNotifications, getUnreadCount } from './src/services/notificationService';
import { query } from './src/db';
import dotenv from 'dotenv';

dotenv.config();

const verifyNewSystem = async () => {
    try {
        console.log("Verifying New Notification System...");

        // 1. Get a valid user
        const userRes = await query('SELECT id, tenant_id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.log("No users found to test.");
            return;
        }

        const { id: userId, tenant_id: tenantId } = userRes.rows[0];
        console.log(`Testing with Tenant: ${tenantId}, User: ${userId}`);

        // 2. Create a test notification
        console.log("Creating test notification...");
        const newNotif = await createNotification(
            tenantId,
            userId,
            "Test Notification",
            "This is a test message from verification script",
            "success"
        );
        console.log("Created:", newNotif.id);

        // 3. Fetch notifications
        console.log("Fetching notifications...");
        const list = await getNotifications(tenantId, userId);
        console.log(`Fetched ${list.length} notifications.`);
        const found = list.find((n: any) => n.id === newNotif.id);

        if (found) {
            console.log("SUCCESS: Found the newly created notification.");
        } else {
            console.error("FAILURE: Could not find the new notification.");
        }

        // 4. Check Unread Count
        const count = await getUnreadCount(tenantId, userId);
        console.log("Unread count:", count);

    } catch (err) {
        console.error("VERIFICATION FAILED:", err);
    }
    process.exit(0);
};

verifyNewSystem();
