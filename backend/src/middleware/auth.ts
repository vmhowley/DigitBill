import { NextFunction, Request, Response } from "express";
import { query } from "../db";
import { supabase } from "../services/supabase";

// Helper to check for missing envs, but supabase service handles logging now
if (!process.env.SUPABASE_URL) {
  console.error("ERROR: Missing SUPABASE_URL in .env");
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any; // Should interface this
      tenantId?: number;
      userId?: number;
      role?: string;
      plan?: string;
    }
  }
}

import * as fs from 'fs';
import * as path from 'path';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const log = (msg: string) => {
    try { fs.appendFileSync(path.join(__dirname, '../../cols.txt'), `[Auth ${new Date().toISOString()}] ${msg}\n`); } catch (e) { }
  };

  log(`Checking ${req.method} ${req.originalUrl}`);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    log(`FAIL: Missing Header for ${req.originalUrl}`);
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // 1. Verify Token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      log(`FAIL: Invalid Token for ${user?.email || 'unknown'}`);
      return res.status(401).json({ error: "Invalid token" });
    }

    // 2. Resolve Tenant
    const userRes = await query(
      `
      SELECT u.id, u.tenant_id, u.role, t.plan, t.subscription_end_date 
      FROM users u 
      JOIN tenants t ON u.tenant_id = t.id 
      WHERE u.supabase_uid = $1
    `,
      [user.id]
    );

    let authInfo;

    if (userRes.rows.length > 0) {
      authInfo = userRes.rows[0];
    } else {
      // Legacy check (by email)
      const emailCheck = await query(
        `
        SELECT u.id, u.tenant_id, u.role, t.plan, t.subscription_end_date 
        FROM users u 
        JOIN tenants t ON u.tenant_id = t.id 
        WHERE u.username = $1
      `,
        [user.email]
      );

      if (emailCheck.rows.length > 0) {
        authInfo = emailCheck.rows[0];
        // Link UID
        await query("UPDATE users SET supabase_uid = $1 WHERE id = $2", [user.id, authInfo.id]);
      }
    }

    if (!authInfo) {
      log(`FAIL: No Tenant for ${user.email}`);
      console.warn(`Unauthorized access: ${user.email} (No tenant)`);
      return res.status(403).json({ error: "Access Denied: No active subscription found." });
    }

    const { id: localUserId, tenant_id: tenantId, role, plan, subscription_end_date: endDate } = authInfo;

    // 3. Check Expiration
    const now = new Date();
    let isExpired = false;
    let isAllowed = false;

    if (plan !== "free" && endDate) {
      isExpired = new Date(endDate) < now;

      if (isExpired) {
        const allowedRoutes = ['/api/settings', '/api/subscriptions', '/api/auth'];
        isAllowed = allowedRoutes.some(route => req.originalUrl.startsWith(route));

        if (!isAllowed) {
          log(`BLOCK: Expired ${user.email} accessing ${req.originalUrl} (Plan: ${plan}, End: ${endDate})`);
          return res.status(403).json({
            error: "Suscripción Vencida. Por favor renueve su licencia para continuar.",
            code: "SUBSCRIPTION_EXPIRED"
          });
        }
      }
    }

    log(`ALLOW: ${user.email} accessing ${req.originalUrl} (Expired: ${isExpired}, Allowed: ${isAllowed})`);

    // 4. Attach to request
    req.user = { ...user, role };
    req.tenantId = tenantId;
    req.userId = localUserId;
    req.plan = plan || "free";

    next();
  } catch (err: any) {
    log(`CRITICAL ERROR: ${err.message}`);
    console.error("Auth Middleware Error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "Access Denied: Insufficient permissions" });
    }
    next();
  };
};
