import { Router } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    // req.user is already populated by requireAuth with role
    // But let's fetch full details from DB to be sure/clean
    const userRes = await query(
      "SELECT id, username, role, tenant_id FROM users WHERE supabase_uid = $1",
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const user = userRes.rows[0];
    const tenantRes = await query(
      "SELECT name, plan, subscription_end_date FROM tenants WHERE id = $1",
      [user.tenant_id]
    );

    const tenant = tenantRes.rows[0] || {};
    let plan = tenant.plan || "free";
    const endDate = tenant.subscription_end_date;
    let status = "active";

    // Check expiration
    if (plan !== "free" && endDate) {
      if (new Date(endDate) < new Date()) {
        plan = "free";
        status = "expired";
      }
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      tenant_id: user.tenant_id,
      tenant_name: tenant.name || "Unknown",
      plan,
      subscription_status: status,
      subscription_end_date: endDate,
      email: req.user.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching profile" });
  }
});

export default router;
