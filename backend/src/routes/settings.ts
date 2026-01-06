import { Router } from 'express';
import { query } from '../db';
import { requireAuth, requireRole } from '../middleware/auth';
import { supabaseAdmin } from '../services/supabase';
import { getPlanLimits } from '../utils/planLimits';
import * as configService from '../services/configService';

const router = Router();

router.use(requireAuth);
// Only Admin can access settings
router.use(requireRole(['admin']));

// GET /api/settings/company
router.get('/company', async (req, res) => {
    try {
        const tenantRes = await query(
            'SELECT name, rnc, address, phone, email, type FROM tenants WHERE id = $1',
            [req.tenantId]
        );
        if (tenantRes.rows.length === 0) return res.status(404).json({ error: 'Company not found' });
        
        const config = await configService.getCompanyConfig(req.tenantId!);
        
        res.json({
            ...tenantRes.rows[0],
            ...config
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching company info' });
    }
});

// PUT /api/settings/company
router.put('/company', async (req, res) => {
    try {
        const { name, address, phone, email, electronic_invoicing, certificate_password } = req.body;
        
        await query(
            'UPDATE tenants SET name = $1, address = $2, phone = $3, email = $4 WHERE id = $5',
            [name, address, phone, email, req.tenantId]
        );

        // Update electronic invoicing toggle
        if (electronic_invoicing !== undefined) {
            await configService.updateCompanyConfig(req.tenantId!, 'electronic_invoicing', electronic_invoicing.toString());
        }

        // Update certificate password
        if (certificate_password) {
            await configService.updateCompanyConfig(req.tenantId!, 'certificate_password', certificate_password);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating company info' });
    }
});

// GET /api/settings/users
router.get('/users', async (req, res) => {
    try {
        const result = await query(
            'SELECT id, username, role, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// GET /api/settings/sequences
router.get('/sequences', async (req, res) => {
    try {
        const result = await query(
            'SELECT * FROM sequences WHERE tenant_id = $1 ORDER BY type_code ASC',
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching sequences' });
    }
});

// PUT /api/settings/sequences/:id
router.put('/sequences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { next_number, end_date, current_end_number } = req.body;
        
        await query(
            'UPDATE sequences SET next_number = $1, end_date = $2, current_end_number = $3 WHERE id = $4 AND tenant_id = $5',
            [next_number, end_date, current_end_number, id, req.tenantId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating sequence' });
    }
});



// POST /api/settings/users/invite
router.post('/users/invite', async (req, res) => {
    try {
        const { email, role } = req.body;
        
        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required' });
        }

        // 2. Check Plan Limits before inviting
        const limits = getPlanLimits(req.plan);
        
        const countRes = await query('SELECT COUNT(*) as count FROM users WHERE tenant_id = $1', [req.tenantId]);
        const currentCount = parseInt(countRes.rows[0].count);

        if (currentCount >= limits.maxUsers) {
            return res.status(403).json({ 
                error: `Tu plan actual (${req.plan?.toUpperCase()}) solo permite ${limits.maxUsers} usuarios. Actualiza para obtener más.` 
            });
        }

        // 3. Invite via Supabase
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

        if (authError) {
             console.error('Supabase Invite Error:', authError);
             // If user already exists, we might just want to link them? 
             // For now, let's treat it as error or check if it's "User already registered"
             return res.status(400).json({ error: authError.message });
        }

        const supabaseUid = authData.user.id;

        // 2. Add to Local DB linked to this tenant
        // Check if user already exists in local DB
        const existingUser = await query('SELECT id FROM users WHERE email = $1 OR supabase_uid = $2', [email, supabaseUid]);
        
        if (existingUser.rows.length > 0) {
             return res.status(400).json({ error: 'User already exists in this system' });
        }

        await query(
            'INSERT INTO users (tenant_id, username, password_hash, role, supabase_uid) VALUES ($1, $2, $3, $4, $5)',
            [req.tenantId, email, 'supabase_managed', role, supabaseUid]
        );

        res.json({ success: true, message: 'User invited successfully' });

    } catch (err: any) {
        console.error('Invite Error:', err);
        res.status(500).json({ error: 'Failed to invite user' });
    }
});

export default router;
