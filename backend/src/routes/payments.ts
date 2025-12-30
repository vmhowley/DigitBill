import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as paymentService from "../services/paymentService";

const router = Router();

router.use(requireAuth);

// POST /api/payments
router.post("/", async (req, res) => {
  try {
    const payment = await paymentService.recordPayment(req.tenantId!, req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: "Error recording payment" });
  }
});

// GET /api/payments/invoice/:id
router.get("/invoice/:id", async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByInvoice(
      req.tenantId!,
      parseInt(req.params.id)
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Error fetching payments" });
  }
});

// GET /api/payments/client/:id
router.get("/client/:id", async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByClient(
      req.tenantId!,
      parseInt(req.params.id)
    );
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Error fetching payments" });
  }
});

// GET /api/payments/ar-total
router.get("/ar-total", async (req, res) => {
  try {
    const total = await paymentService.getTotalAR(req.tenantId!);
    res.json({ total_ar: total });
  } catch (err) {
    res.status(500).json({ error: "Error fetching AR total" });
  }
});

export default router;
