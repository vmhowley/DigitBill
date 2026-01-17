
import { query } from '../db';

export const getNotifications = async (tenantId: number, userId: number) => {
    // Get notifications for specific user OR for the entire tenant (where user_id is null)
    try {
        const res = await query(
            `SELECT * FROM notifications 
             WHERE tenant_id = $1 
             AND (user_id = $2 OR user_id IS NULL)
             ORDER BY created_at DESC 
             LIMIT 50`,
            [tenantId, userId]
        );
        return res.rows;
    } catch (err) {
        console.error("Error in getNotifications service:", err);
        throw err;
    }
};

export const getUnreadCount = async (tenantId: number, userId: number) => {
    try {
        const res = await query(
            `SELECT COUNT(*) as count FROM notifications 
             WHERE tenant_id = $1 
             AND (user_id = $2 OR user_id IS NULL) 
             AND read = false`,
            [tenantId, userId]
        );
        return parseInt(res.rows[0].count, 10);
    } catch (err) {
        console.error("Error in getUnreadCount service:", err);
        throw err;
    }
};

export const markAsRead = async (id: number, tenantId: number) => {
    // Securely mark as read ensuring tenant ownership
    try {
        await query(
            `UPDATE notifications SET read = true WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        return { success: true };
    } catch (err) {
        console.error("Error in markAsRead service:", err);
        throw err;
    }
};

export const markAllAsRead = async (tenantId: number, userId: number) => {
    try {
        await query(
            `UPDATE notifications 
             SET read = true 
             WHERE tenant_id = $1 
             AND (user_id = $2 OR user_id IS NULL) 
             AND read = false`,
            [tenantId, userId]
        );
        return { success: true };
    } catch (err) {
        console.error("Error in markAllAsRead service:", err);
        throw err;
    }
};

export const deleteAllNotifications = async (tenantId: number, userId: number) => {
    try {
        await query(
            `DELETE FROM notifications 
             WHERE tenant_id = $1 
             AND (user_id = $2 OR user_id IS NULL)`,
            [tenantId, userId]
        );
        return { success: true };
    } catch (err) {
        console.error("Error in deleteAllNotifications service:", err);
        throw err;
    }
};

export const createNotification = async (
    tenantId: number,
    userId: number | null,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    link?: string
) => {
    try {
        const res = await query(
            `INSERT INTO notifications (tenant_id, user_id, title, message, type, link)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [tenantId, userId, title, message, type, link]
        );
        return res.rows[0];
    } catch (err) {
        console.error("Error in createNotification service:", err);
        throw err;
    }
};
