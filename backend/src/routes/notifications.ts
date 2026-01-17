
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead, deleteAllNotifications } from '../services/notificationService';

import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Middleware to log all requests to this router for debugging
router.use((req, res, next) => {
    try { fs.appendFileSync(path.join(__dirname, '../../debug_route.log'), `[${new Date().toISOString()}] ${req.method} ${req.path}\n`); } catch (e) { }
    console.log(`[NotificationRouter] ${req.method} ${req.path}`);
    next();
});

router.use(requireAuth);

router.get('/', async (req: any, res) => {
    console.log(`[NotificationRouter] GET / - Start. Tenant: ${req.tenantId}, User: ${req.userId}`);
    try {
        const tenantId = req.tenantId;
        const userId = req.userId;

        if (!tenantId || !userId) {
            console.error('[NotificationRouter] Missing tenant or user ID');
            return res.status(400).json({ error: 'Missing tenant or user identification' });
        }

        const notifications = await getNotifications(tenantId, userId);
        console.log(`[NotificationRouter] Fetched ${notifications.length} notifications`);
        res.json(notifications);
    } catch (error: any) {
        try { fs.writeFileSync(path.join(__dirname, '../../last_error.txt'), `Route Error: ${error.message}\nStack: ${error.stack}`); } catch (e) { }
        console.log('CAUGHT ERROR', error);
        res.status(500).json({
            error: 'Error fetching notifications',
            details: error.message || 'No message',
            fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
        });
    }
});

router.get('/unread-count', async (req: any, res) => {
    console.log(`[NotificationRouter] GET /unread-count - Start. Tenant: ${req.tenantId}, User: ${req.userId}`);
    try {
        const tenantId = req.tenantId;
        const userId = req.userId;

        if (!tenantId || !userId) {
            console.error('[NotificationRouter] Missing tenant or user ID');
            return res.status(400).json({ error: 'Missing tenant or user identification' });
        }

        const count = await getUnreadCount(tenantId, userId);
        console.log(`[NotificationRouter] Unread count: ${count}`);
        res.json({ count });
    } catch (error: any) {
        console.error('[NotificationRouter] Error in GET /unread-count:', error);
        res.status(500).json({ error: 'Error fetching count', details: error.message });
    }
});

router.put('/:id/read', async (req: any, res) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        await markAsRead(id, tenantId);
        res.json({ success: true });
    } catch (error: any) {
        console.error('[NotificationRouter] Error in PUT /:id/read:', error);
        res.status(500).json({ error: 'Error updating notification' });
    }
});

router.put('/read-all', async (req: any, res) => {
    try {
        const tenantId = req.tenantId;
        const userId = req.userId;
        await markAllAsRead(tenantId, userId);
        res.json({ success: true });
    } catch (error: any) {
        console.error('[NotificationRouter] Error in PUT /read-all:', error);
        res.status(500).json({ error: 'Error updating notifications' });
    }
});

router.delete('/:id', async (req: any, res) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const { deleteNotification } = require('../services/notificationService');
        await deleteNotification(id, tenantId);
        res.json({ success: true });
    } catch (error: any) {
        console.error('[NotificationRouter] Error in DELETE /:id:', error);
        res.status(500).json({ error: 'Error deleting notification' });
    }
});

router.delete('/', async (req: any, res) => {
    try {
        const tenantId = req.tenantId;
        const userId = req.userId;
        await deleteAllNotifications(tenantId, userId);
        res.json({ success: true });
    } catch (error: any) {
        console.error('[NotificationRouter] Error in DELETE /:', error);
        res.status(500).json({ error: 'Error deleting notifications' });
    }
});

export default router;
