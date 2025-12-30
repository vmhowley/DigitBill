import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as reportService from "../services/reportService";

const router = Router();
router.use(requireAuth);

router.get("/606", async (req, res) => {
  const { month, year } = req.query;
  const csv = await reportService.get606(
    req.tenantId!,
    month as string,
    year as string
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=606_${year}_${month}.csv`
  );
  res.send(csv);
});

router.get("/607", async (req, res) => {
  const { month, year } = req.query;
  const csv = await reportService.get607(
    req.tenantId!,
    month as string,
    year as string
  );
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=607_${year}_${month}.csv`
  );
  res.send(csv);
});

export default router;
