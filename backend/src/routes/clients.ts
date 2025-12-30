import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(requireAuth);

// GET /api/clients
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM clients WHERE tenant_id = $1 ORDER BY name ASC', [req.tenantId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM clients WHERE id = $1 AND tenant_id = $2', [id, req.tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/clients
router.post('/', async (req, res) => {
  try {
    const { name, rnc_ci, address, email, phone, type } = req.body;
    const result = await query(
      'INSERT INTO clients (tenant_id, name, rnc_ci, address, email, phone, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.tenantId, name, rnc_ci, address, email, phone, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ error: 'Error creating client', details: (err as any).message });
  }
});

// PUT /api/clients/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rnc_ci, address, email, phone, type } = req.body;
    const result = await query(
      'UPDATE clients SET name=$1, rnc_ci=$2, address=$3, email=$4, phone=$5, type=$6 WHERE id=$7 AND tenant_id=$8 RETURNING *',
      [name, rnc_ci, address, email, phone, type, id, req.tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating client' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if client has invoices
    const invoices = await query('SELECT id FROM invoices WHERE client_id = $1 AND tenant_id = $2 LIMIT 1', [id, req.tenantId]);
    if (invoices.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete client with existing invoices' });
    }

    const result = await query('DELETE FROM clients WHERE id = $1 AND tenant_id = $2 RETURNING id', [id, req.tenantId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting client' });
  }
});

export default router;
