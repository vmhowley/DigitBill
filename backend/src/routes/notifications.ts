
import { Router } from 'express';
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from '../services/notificationService';

const router = Router();

// Get recent notifications for the logged-in user
router.get('/', async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        const notifications = await getNotifications(tenantId, userId);
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching notifications' });
    }
});

// Get unread count (for badge)
router.get('/unread-count', async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        const count = await getUnreadCount(tenantId, userId);
        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching count' });
    }
});

// Mark single notification as read
router.put('/:id/read', async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { id } = req.params;
        await markAsRead(id, tenantId);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating notification' });
    }
});

// Mark all as read
router.put('/read-all', async (req: any, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        await markAllAsRead(tenantId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating notifications' });
    }
});

export default router;
