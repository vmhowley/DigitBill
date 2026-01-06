import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as expenseService from "../services/expenseService";

const router = Router();
router.use(requireAuth);

// Providers
router.get("/providers", async (req, res) => {
  const providers = await expenseService.getProviders(req.tenantId!);
  res.json(providers);
});

router.post("/providers", async (req, res) => {
  const provider = await expenseService.createProvider(req.tenantId!, req.body);
  res.json(provider);
});

router.get("/providers/:id", async (req, res) => {
  const provider = await expenseService.getProvider(req.tenantId!, parseInt(req.params.id));
  if (!provider) return res.status(404).json({ error: "Provider not found" });
  res.json(provider);
});

router.put("/providers/:id", async (req, res) => {
  const provider = await expenseService.updateProvider(req.tenantId!, parseInt(req.params.id), req.body);
  res.json(provider);
});

router.delete("/providers/:id", async (req, res) => {
  await expenseService.deleteProvider(req.tenantId!, parseInt(req.params.id));
  res.status(204).end();
});

// Expenses
router.get("/", async (req, res) => {
  const expenses = await expenseService.getExpenses(req.tenantId!);
  res.json(expenses);
});

router.post("/", async (req, res) => {
  const expense = await expenseService.createExpense(req.tenantId!, req.body);
  res.json(expense);
});

router.get("/stats", async (req, res) => {
  const stats = await expenseService.getExpenseStats(req.tenantId!);
  res.json(stats);
});

export default router;
