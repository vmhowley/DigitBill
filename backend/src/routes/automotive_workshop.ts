
import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/automotive/workshop/orders
// List all active work orders
router.get('/orders', async (req, res) => {
    try {
        const result = await query(`
            SELECT w.*, 
                   v.make, v.model, v.year, v.vin, v.plate,
                   (SELECT COUNT(*) FROM work_order_items WHERE work_order_id = w.id) as item_count
            FROM work_orders w
            JOIN vehicles v ON w.vehicle_id = v.id
            WHERE w.tenant_id = $1
            ORDER BY w.created_at DESC
        `, [req.tenantId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching work orders' });
    }
});

// GET /api/automotive/workshop/vehicles/:id/orders
// List work orders for a specific vehicle
router.get('/vehicles/:id/orders', async (req, res) => {
    try {
        const result = await query(`
            SELECT w.*, 
                   (SELECT COUNT(*) FROM work_order_items WHERE work_order_id = w.id) as item_count
            FROM work_orders w
            WHERE w.vehicle_id = $1 AND w.tenant_id = $2
            ORDER BY w.created_at DESC
        `, [req.params.id, req.tenantId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching vehicle orders' });
    }
});

// POST /api/automotive/workshop/orders
// Create a new Work Order
router.post('/orders', async (req, res) => {
    try {
        const { vehicle_id, notes } = req.body;

        // Verify vehicle exists
        const vCheck = await query('SELECT id FROM vehicles WHERE id = $1 AND tenant_id = $2', [vehicle_id, req.tenantId]);
        if (vCheck.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

        const result = await query(
            `INSERT INTO work_orders (tenant_id, vehicle_id, status, notes)
             VALUES ($1, $2, 'pending', $3)
             RETURNING *`,
            [req.tenantId, vehicle_id, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating work order' });
    }
});

// GET /api/automotive/workshop/orders/:id
// Get details of a work order
router.get('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const orderRes = await query(`
            SELECT w.*, v.make, v.model, v.year, v.vin
            FROM work_orders w
            JOIN vehicles v ON w.vehicle_id = v.id
            WHERE w.id = $1 AND w.tenant_id = $2
        `, [id, req.tenantId]);

        if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

        const itemsRes = await query(`
            SELECT * FROM work_order_items WHERE work_order_id = $1 ORDER BY created_at
        `, [id]);

        res.json({ ...orderRes.rows[0], items: itemsRes.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching order details' });
    }
});

// POST /api/automotive/workshop/orders/:id/items
// Add Item to Order
router.post('/orders/:id/items', async (req, res) => {
    const client = await query('BEGIN');
    try {
        const { id } = req.params;
        const { description, quantity, unit_cost, type, vendor } = req.body;

        const total_cost = quantity * unit_cost;

        // 1. Insert Item
        const itemRes = await query(
            `INSERT INTO work_order_items (tenant_id, work_order_id, description, quantity, unit_cost, total_cost, type, vendor)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [req.tenantId, id, description, quantity, unit_cost, total_cost, type, vendor]
        );

        // 2. Update Work Order Totals
        // Trigger-like logic to sum up totals
        await query(`
            UPDATE work_orders 
            SET 
                total_parts = (SELECT COALESCE(SUM(total_cost), 0) FROM work_order_items WHERE work_order_id = $1 AND type = 'part'),
                total_labor = (SELECT COALESCE(SUM(total_cost), 0) FROM work_order_items WHERE work_order_id = $1 AND type = 'labor'),
                total_cost = (SELECT COALESCE(SUM(total_cost), 0) FROM work_order_items WHERE work_order_id = $1)
            WHERE id = $1
        `, [id]);

        await query('COMMIT');
        res.status(201).json(itemRes.rows[0]);
    } catch (err) {
        await query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error adding item' });
    }
});

// POST /api/automotive/workshop/orders/:id/complete
// Complete the order and update vehicle cost base
router.post('/orders/:id/complete', async (req, res) => {
    const client = await query('BEGIN');
    try {
        const { id } = req.params;

        // 1. Get totals
        const orderRes = await query('SELECT * FROM work_orders WHERE id = $1 AND tenant_id = $2', [id, req.tenantId]);
        if (orderRes.rows.length === 0) throw new Error('Order not found');
        const order = orderRes.rows[0];

        if (order.status === 'completed') throw new Error('Order already completed');

        // 2. Mark as completed
        await query('UPDATE work_orders SET status = \'completed\', end_date = CURRENT_DATE WHERE id = $1', [id]);

        // 3. Update Vehicle Cost
        // Add the total cost of this work order to the vehicle's cost basis
        if (order.total_cost > 0) {
            await query(
                'UPDATE vehicles SET cost = COALESCE(cost, 0) + $1 WHERE id = $2',
                [order.total_cost, order.vehicle_id]
            );
        }

        await query('COMMIT');
        res.json({ message: 'Order completed', total_cost: order.total_cost });

    } catch (err: any) {
        await query('ROLLBACK');
        res.status(400).json({ error: err.message });
    }
});

export default router;
