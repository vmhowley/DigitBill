import { NextFunction, Request, Response } from 'express';
import { query } from '../db';
import { supabase, supabaseAdmin } from '../services/supabase';

// Helper to check for missing envs, but supabase service handles logging now
if (!process.env.SUPABASE_URL) {
   console.error('ERROR: Missing SUPABASE_URL in .env');
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any; // Should interface this
      tenantId?: number;
      role?: string;
      plan?: string;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // 1. Verify Token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 2. Security Check: Enforce 2FA if enabled
    // Note: Temporarily disabled 2FA enforcement as requested by user.
    /*
    const payloadIndex = token.indexOf('.') + 1;
    const payloadEndIndex = token.lastIndexOf('.');
    const payload = JSON.parse(Buffer.from(token.substring(payloadIndex, payloadEndIndex), 'base64').toString('utf-8'));
    const currentAal = payload.aal; // 'aal1', 'aal2', etc.

    // Check if user has verified 2FA factors
    const { data: factorsData, error: factorsError } = await supabaseAdmin.auth.admin.mfa.listFactors({
        userId: user.id
    });

    if (!factorsError && factorsData && factorsData.factors) {
        const hasVerifiedFactor = factorsData.factors.some((f: any) => f.status === 'verified');
        
        if (hasVerifiedFactor && currentAal !== 'aal2') {
             console.warn(`User ${user.email} has 2FA enabled but session is ${currentAal}. Denying access.`);
             return res.status(403).json({ error: '2FA Verification Required', code: 'mfa_required' });
        }
    }
    */

    // 3. Resolve Tenant
    // Check if user exists in local DB
    const userRes = await query(`
      SELECT u.id, u.tenant_id, u.role, t.plan 
      FROM users u 
      JOIN tenants t ON u.tenant_id = t.id 
      WHERE u.supabase_uid = $1
    `, [user.id]);
    
    let tenantId;
    let plan;
    let role;

    if (userRes.rows.length === 0) {
      // Check if maybe they exist by email but haven't linked UID yet (migrating legacy users)
      const emailCheck = await query(`
        SELECT u.id, u.tenant_id, u.role, t.plan 
        FROM users u 
        JOIN tenants t ON u.tenant_id = t.id 
        WHERE u.username = $1
      `, [user.email]);
      
      if (emailCheck.rows.length > 0) {
        // Link existing legacy user to the new Supabase UID
        tenantId = emailCheck.rows[0].tenant_id;
        plan = emailCheck.rows[0].plan;
        role = emailCheck.rows[0].role;
        await query('UPDATE users SET supabase_uid = $1 WHERE id = $2', [user.id, emailCheck.rows[0].id]);
      } else {
        // STRICT MODE: If user is not in our DB, deny access.
        // This prevents random people from logging in.
        console.warn(`Unauthorized login attempt: ${user.email} (UID: ${user.id}) - No tenant assigned.`);
        return res.status(403).json({ error: 'Access Denied: No active subscription found for this user.' });
      }
    } else {
      tenantId = userRes.rows[0].tenant_id;
      plan = userRes.rows[0].plan;
      role = userRes.rows[0].role;
    }

    // Attach to request
    req.user = { ...user, role }; // Attach role
    req.tenantId = tenantId;
    req.plan = plan || 'free';

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Access Denied: Insufficient permissions' });
        }
        next();
    }
};
