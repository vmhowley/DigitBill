import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as inventoryService from "../services/inventoryService";

const router = Router();
router.use(requireAuth);

router.get("/movements/:productId", async (req, res) => {
  try {
    const moves = await inventoryService.getMovementsByProduct(
      req.tenantId!,
      parseInt(req.params.productId)
    );
    res.json(moves);
  } catch (err) {
    res.status(500).json({ error: "Error fetching movements" });
  }
});

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await inventoryService.getStockAlerts(req.tenantId!);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching alerts" });
  }
});

router.post("/adjust", async (req, res) => {
  try {
    const move = await inventoryService.recordMovement(req.tenantId!, {
      ...req.body,
      type: req.body.type || "adjustment",
      reason: req.body.reason || "Manual Adjustment",
    });
    res.json(move);
  } catch (err) {
    res.status(500).json({ error: "Error recording adjustment" });
  }
});

export default router;
