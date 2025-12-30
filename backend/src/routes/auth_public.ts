import { supabaseAdmin } from '../services/supabase';
import { Router } from 'express';
import { query } from '../db';

const router = Router();


// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Fetch user and tenant info to return plan_type
        const userRes = await query('SELECT tenant_id, role, username FROM users WHERE supabase_uid = $1', [data.user.id]);
        let userDetails = null;
        let planType = 'pyme'; // Default

        if (userRes.rows.length > 0) {
            userDetails = userRes.rows[0];
            const tenantRes = await query('SELECT plan_type FROM tenants WHERE id = $1', [userDetails.tenant_id]);
            if (tenantRes.rows.length > 0) {
                planType = tenantRes.rows[0].plan_type;
            }
        }

        res.json({
            token: data.session.access_token,
            user: {
                ...data.user,
                ...userDetails,
                plan_type: planType
            }
        });
    } catch (err: any) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /register
router.post('/register', async (req, res) => {
    try {
        const adminSecret = req.headers['x-admin-secret'];
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ error: 'Forbidden: Admin Secret Required' });
        }

        const { email, password, company_name, rnc, phone, address, type } = req.body;


        // Basic validation
        if (!email || !password || !company_name || !rnc) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        // Validate RNC length
        if (rnc.length !== 9 && rnc.length !== 11) {
            return res.status(400).json({ error: 'El RNC/Cédula debe tener 9 u 11 dígitos' });
        }

        console.log(`Creating user ${email} for company ${company_name}`);

        // 1. Create User in Supabase
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true // Auto-confirm for this flow
        });

        if (authError) {
            console.error('Supabase Auth Error:', authError);
            return res.status(400).json({ error: 'Error creando usuario: ' + authError.message });
        }

        const uid = authData.user.id;

        // 2. Transaction for DB
        await query('BEGIN');

        try {
            // Create Tenant
            const tenantRes = await query(
                'INSERT INTO tenants (name, rnc, address, phone, email, type, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
                [company_name, rnc, address, phone, email, type, 'active']
            );
            const tenantId = tenantRes.rows[0].id;

            // Create Admin User
            await query(
                'INSERT INTO users (tenant_id, username, password_hash, role, supabase_uid) VALUES ($1, $2, $3, $4, $5)',
                [tenantId, email, 'managed_by_supabase', 'admin', uid]
            );

            // Create Default Sequences (Optional but helpful)
            // e.g. Factura de Crédito Fiscal (31)
            await query(
                `INSERT INTO sequences (tenant_id, type_code, next_number, end_date) 
                 VALUES ($1, '31', 1, '2030-12-31')`, 
                 [tenantId]
            );

            await query('COMMIT');

            res.json({ success: true, message: 'Cuenta creada exitosamente', tenant_id: tenantId });

        } catch (dbError) {
            await query('ROLLBACK');
            // Cleanup Supabase user if DB fails (manual rollback for Auth)
            await supabaseAdmin.auth.admin.deleteUser(uid);
            throw dbError;
        }

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Error interno del servidor al registrar' });
    }
});

export default router;
