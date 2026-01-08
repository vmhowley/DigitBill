import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { initDb } from "./db";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import authPublicRoutes from "./routes/auth_public";
import clientRoutes from "./routes/clients";
import dgiiRoutes from "./routes/dgii";
import expenseRoutes from "./routes/expenses";
import inventoryRoutes from "./routes/inventory";
import invoiceRoutes from "./routes/invoices";
import paymentRoutes from "./routes/payments";
import productRoutes from "./routes/products";
import publicRoutes from "./routes/public";
import reportRoutes from "./routes/reports";
import settingsRoutes from "./routes/settings";
import subscriptionRoutes from "./routes/subscriptions";

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://app.digitbill.do",
  "https://digitbill.do",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // start-allow-no-origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // For development felixibility, you might want to log this instead of failing hard if you are unsure of all domains
        console.log("CORS blocked origin:", origin);
        // return callback(new Error('Not allowed by CORS'), false); // Strict mode
        return callback(null, true); // Permissive mode for now but logging it
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
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
app.use("/api/public", publicRoutes);

app.get("/", (req, res) => {
  res.send("Facturación Electrónica API is running");
});

app.listen(port, async () => {
  await initDb();
  console.log(`Server is running on port ${port}`);
});
