import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import clientRoutes from "./routes/clients";
import expenseRoutes from "./routes/expenses";
import inventoryRoutes from "./routes/inventory";
import invoiceRoutes from "./routes/invoices";
import paymentRoutes from "./routes/payments";
import productRoutes from "./routes/products";
import reportRoutes from "./routes/reports";
import dgiiRoutes from "./routes/dgii";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import authPublicRoutes from "./routes/auth_public";
import settingsRoutes from "./routes/settings";
import subscriptionRoutes from "./routes/subscriptions";
import { initDb } from "./db";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/invoices", invoiceRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth/public", authPublicRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dgii", dgiiRoutes);

app.get("/", (req, res) => {
  res.send("Facturación Electrónica API is running");
});

app.listen(port, async () => {
  await initDb();
  console.log(`Server is running on port ${port}`);
});
