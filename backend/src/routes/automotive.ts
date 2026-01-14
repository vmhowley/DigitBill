
import { Router } from 'express';
import { query, pool } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/automotive/vehicles
router.get('/vehicles', async (req, res) => {
    try {
        const { status } = req.query;
        let queryStr = `
            SELECT v.*, 
                   s.id as sale_id, s.sale_price, s.created_at as sale_date
            FROM vehicles v
            LEFT JOIN vehicle_sales s ON v.id = s.vehicle_id AND s.status != 'cancelled'
            WHERE v.tenant_id = $1
        `;
        const params: any[] = [req.tenantId];

        if (status) {
            queryStr += ` AND v.status = $2`;
            params.push(status);
        }

        queryStr += ` ORDER BY v.created_at DESC`;

        const result = await query(queryStr, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching vehicles' });
    }
});

// GET /api/automotive/vehicles/:id
router.get('/vehicles/:id', async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM vehicles WHERE id = $1 AND tenant_id = $2`,
            [req.params.id, req.tenantId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching vehicle' });
    }
});

import * as expenseService from '../services/expenseService';

// ... (existing imports)

// POST /api/automotive/vehicles
router.post('/vehicles', async (req, res) => {
    const client = await query('BEGIN');
    try {
        const { make, model, year, trim, vin, plate, color, mileage, condition, status, price, cost, description, photo_url, register_expense } = req.body;

        const result = await query(
            `INSERT INTO vehicles 
            (tenant_id, make, model, year, trim, vin, plate, color, mileage, condition, status, price, cost, description, photo_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *`,
            [
                req.tenantId,
                make, model, year, trim || '', vin, plate, color,
                mileage || 0,
                condition || 'used',
                status || 'available',
                price,
                cost || 0,
                description, photo_url
            ]
        );

        if (register_expense && cost > 0) {
            await expenseService.createExpense(req.tenantId!, {
                provider_id: null, // No specific provider for general purchase unless specified
                ncf: null,
                description: `Compra Vehículo: ${make} ${model} ${year} (${vin})`,
                amount: cost,
                category: 'Compra de Inventario',
                expense_date: new Date(),
                status: 'paid'
            });
        }

        await query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        await query('ROLLBACK');
        console.error(err);
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'A vehicle with this VIN already exists.' });
        }
        res.status(500).json({ error: 'Error creating vehicle' });
    }
});

// PUT /api/automotive/vehicles/:id
router.put('/vehicles/:id', async (req, res) => {
    try {
        const { make, model, year, trim, vin, plate, color, mileage, condition, status, price, cost, description, photo_url } = req.body;

        const result = await query(
            `UPDATE vehicles SET
            make = $1, model = $2, year = $3, trim = $4, vin = $5, plate = $6, color = $7,
            mileage = $8, condition = $9, status = $10, price = $11, cost = $12,
            description = $13, photo_url = $14
            WHERE id = $15 AND tenant_id = $16
            RETURNING *`,
            [
                make, model, year, trim, vin, plate, color,
                mileage, condition, status, price, cost,
                description, photo_url,
                req.params.id, req.tenantId
            ]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'A vehicle with this VIN already exists.' });
        }
        res.status(500).json({ error: 'Error updating vehicle' });
    }
});

// DELETE /api/automotive/vehicles/:id
router.delete('/vehicles/:id', async (req, res) => {
    try {
        const result = await query(
            `DELETE FROM vehicles WHERE id = $1 AND tenant_id = $2 RETURNING id`,
            [req.params.id, req.tenantId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });
        res.json({ message: 'Vehicle deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting vehicle' });
    }
});

// Loan Vehicle (Inter-Dealer)
router.post('/vehicles/:id/loan', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { dealer_name, dealer_phone, loan_date, expected_return_date, notes } = req.body;
        const vehicleId = req.params.id;

        // Create Loan Record
        await client.query(
            `INSERT INTO vehicle_loans (tenant_id, vehicle_id, dealer_name, dealer_phone, loan_date, expected_return_date, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [req.tenantId, vehicleId, dealer_name, dealer_phone, loan_date, expected_return_date, notes]
        );

        // Update Vehicle Status
        await client.query(
            `UPDATE vehicles SET status = 'loaned' WHERE id = $1 AND tenant_id = $2`,
            [vehicleId, req.tenantId]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Vehicle loaned successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error loaning vehicle' });
    } finally {
        client.release();
    }
});

// Return Vehicle from Loan
router.post('/vehicles/:id/return', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const vehicleId = req.params.id;

        // Close Loan Record
        await client.query(
            `UPDATE vehicle_loans SET status = 'returned' 
            WHERE vehicle_id = $1 AND tenant_id = $2 AND status = 'active'`,
            [vehicleId, req.tenantId]
        );

        // Update Vehicle Status
        await client.query(
            `UPDATE vehicles SET status = 'available' WHERE id = $1 AND tenant_id = $2`,
            [vehicleId, req.tenantId]
        );

        await client.query('COMMIT');
        res.status(200).json({ message: 'Vehicle returned successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Error returning vehicle' });
    } finally {
        client.release();
    }
});

// Get Active Loan Details
router.get('/vehicles/:id/active-loan', async (req, res) => {
    try {
        const result = await query(
            `SELECT * FROM vehicle_loans 
            WHERE vehicle_id = $1 AND tenant_id = $2 AND status = 'active' 
            ORDER BY created_at DESC LIMIT 1`,
            [req.params.id, req.tenantId]
        );
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching loan details' });
    }
});

export default router;
