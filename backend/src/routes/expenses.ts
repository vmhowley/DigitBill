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
