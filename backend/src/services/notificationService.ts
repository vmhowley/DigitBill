
import { query } from '../db';

export const getNotifications = async (tenantId: number, userId: number) => {
    // Get notifications for specific user OR for the entire tenant (where user_id is null)
    const res = await query(
        `SELECT * FROM notifications 
         WHERE tenant_id = $1 
         AND (user_id = $2 OR user_id IS NULL)
         ORDER BY created_at DESC 
         LIMIT 50`,
        [tenantId, userId]
    );
    return res.rows;
};

export const getUnreadCount = async (tenantId: number, userId: number) => {
    const res = await query(
        `SELECT COUNT(*) as count FROM notifications 
         WHERE tenant_id = $1 
         AND (user_id = $2 OR user_id IS NULL) 
         AND read = false`,
        [tenantId, userId]
    );
    return parseInt(res.rows[0].count);
};

export const markAsRead = async (id: number, tenantId: number) => {
    // Simple verification to ensuring tenant owns notification
    await query(
        `UPDATE notifications SET read = true WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
    );
    return { success: true };
};

export const markAllAsRead = async (tenantId: number, userId: number) => {
    await query(
        `UPDATE notifications 
         SET read = true 
         WHERE tenant_id = $1 
         AND (user_id = $2 OR user_id IS NULL) 
         AND read = false`,
        [tenantId, userId]
    );
    return { success: true };
};

export const createNotification = async (
    tenantId: number,
    userId: number | null,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    link?: string
) => {
    const res = await query(
        `INSERT INTO notifications (tenant_id, user_id, title, message, type, link)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [tenantId, userId, title, message, type, link]
    );
    return res.rows[0];
};
