
import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// HELPER: Calculate Monthly Payment (French Amortization)
// Formula: P = (Pv * R) / (1 - (1 + R)^(-n))
router.post('/calculate-payment', (req, res) => {
    try {
        const { amount, rate, months } = req.body;

        if (!amount || !rate || !months) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const monthlyRate = (rate / 100) / 12;
        const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

        res.json({
            monthlyPayment: parseFloat(payment.toFixed(2)),
            totalPayment: parseFloat((payment * months).toFixed(2)),
            totalInterest: parseFloat(((payment * months) - amount).toFixed(2))
        });
    } catch (error) {
        res.status(500).json({ error: 'Calculation error' });
    }
});

// POST /api/automotive/sales
// Create a new sale record and update vehicle status
router.post('/sales', async (req, res) => {
    const client = await query('BEGIN'); // Start Transaction
    try {
        const {
            vehicle_id, client_id, sale_price, down_payment,
            trade_in_amount, financed_amount, interest_rate,
            term_months, monthly_payment, notes
        } = req.body;

        // 1. Verify Vehicle Availability
        const vehicleCheck = await query(
            'SELECT status FROM vehicles WHERE id = $1 AND tenant_id = $2',
            [vehicle_id, req.tenantId]
        );

        if (vehicleCheck.rows.length === 0) throw new Error('Vehicle not found');
        if (vehicleCheck.rows[0].status !== 'available') throw new Error('Vehicle is not available for sale');

        // 2. Create Sale Record
        const saleRes = await query(
            `INSERT INTO vehicle_sales 
            (tenant_id, vehicle_id, client_id, sale_price, down_payment, trade_in_amount, financed_amount, interest_rate, term_months, monthly_payment, status, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'completed', $11)
            RETURNING *`,
            [
                req.tenantId, vehicle_id, client_id,
                sale_price, down_payment || 0, trade_in_amount || 0, financed_amount || 0,
                interest_rate, term_months, monthly_payment, notes
            ]
        );

        // 3. Update Vehicle Status to 'sold'
        await query(
            'UPDATE vehicles SET status = $1 WHERE id = $2',
            ['sold', vehicle_id]
        );

        // 4. Auto-Generate Invoice
        // We need vehicle details for the description
        const vInfo = await query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
        const vehicle = vInfo.rows[0];

        // Calculate tax - Assuming price includes tax or exluded? 
        // For simplicity in this vertical, we'll assume sale_price is the total.
        // We will default to a 'Consumer' invoice (Consumo - 32) since most car sales are to individuals,
        // but this should be logic-driven properly in a robust system.
        const typeCode = '32';
        const subtotal = sale_price; // Simplification: 0 tax for used cars or handled elsewhere
        const tax = 0;
        const total = sale_price;

        const invRes = await query(
            `INSERT INTO invoices 
            (tenant_id, client_id, net_total, tax_total, total, status, type_code, notes)
            VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7)
            RETURNING id`,
            [req.tenantId, client_id, subtotal, tax, total, typeCode, `Auto-generated from Sale #${saleRes.rows[0].id}`]
        );

        const invoiceId = invRes.rows[0].id;

        // Add Line Item
        await query(
            `INSERT INTO invoice_items 
            (tenant_id, invoice_id, quantity, unit_price, line_amount, line_tax, description)
            VALUES ($1, $2, 1, $3, $4, 0, $5)`,
            [
                req.tenantId,
                invoiceId,
                sale_price,
                sale_price,
                `Vehículo: ${vehicle.make} ${vehicle.model} ${vehicle.year} - VIN: ${vehicle.vin}`
            ]
        );

        await query('COMMIT');
        res.status(201).json(saleRes.rows[0]);

    } catch (err: any) {
        await query('ROLLBACK');
        console.error(err);
        res.status(400).json({ error: err.message || 'Error creating sale' });
    }
});

// GET /api/automotive/sales
router.get('/sales', async (req, res) => {
    try {
        const result = await query(`
            SELECT s.*, 
                   v.make, v.model, v.year, v.vin,
                   c.name as client_name 
            FROM vehicle_sales s
            JOIN vehicles v ON s.vehicle_id = v.id
            JOIN clients c ON s.client_id = c.id
            WHERE s.tenant_id = $1
            ORDER BY s.created_at DESC
        `, [req.tenantId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching sales' });
    }
});

// GET /api/automotive/sales/:id
router.get('/sales/:id', async (req, res) => {
    try {
        const result = await query(`
            SELECT s.*, 
                   v.make, v.model, v.year, v.vin, v.color, v.plate,
                   c.name as client_name, c.rnc_ci as client_tax_id, c.address as client_address, c.phone as client_phone
            FROM vehicle_sales s
            JOIN vehicles v ON s.vehicle_id = v.id
            JOIN clients c ON s.client_id = c.id
            WHERE s.id = $1 AND s.tenant_id = $2
        `, [req.params.id, req.tenantId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching sale' });
    }
});

export default router;
