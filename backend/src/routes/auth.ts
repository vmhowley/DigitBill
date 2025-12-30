import { Router } from 'express';
import { query } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        // req.user is already populated by requireAuth with role
        // But let's fetch full details from DB to be sure/clean
        const userRes = await query('SELECT id, username, role, tenant_id FROM users WHERE supabase_uid = $1', [req.user.id]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found in database' });
        }

        const user = userRes.rows[0];
        const tenantRes = await query('SELECT name, plan_type FROM tenants WHERE id = $1', [user.tenant_id]);
        
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            tenant_id: user.tenant_id,
            tenant_name: tenantRes.rows[0]?.name || 'Unknown',
            plan_type: tenantRes.rows[0]?.plan_type || 'pyme',
            email: req.user.email
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

export default router;
