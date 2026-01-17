import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { initDb } from "./db";
import adminRoutes from "./routes/admin";
import authRoutes from "./routes/auth";
import authPublicRoutes from "./routes/auth_public";
import automotiveRoutes from "./routes/automotive";
import automotiveSalesRoutes from "./routes/automotive_sales";
import automotiveWorkshopRoutes from "./routes/automotive_workshop";
import clientRoutes from "./routes/clients";
import deliveryRoutes from "./routes/delivery";
import dgiiRoutes from "./routes/dgii";
import expenseRoutes from "./routes/expenses";
import inventoryRoutes from "./routes/inventory";
import invoiceRoutes from "./routes/invoices";
import paymentRoutes from "./routes/payments";
import productRoutes from "./routes/products";
import publicRoutes from "./routes/public";
import reportRoutes from "./routes/reports";
import searchRoutes from "./routes/search";
import settingsRoutes from "./routes/settings";
import subscriptionRoutes from "./routes/subscriptions";
import notificationRoutes from "./routes/notifications";

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
app.use("/api/delivery", deliveryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dgii", dgiiRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/automotive", automotiveRoutes);
app.use("/api/automotive", automotiveSalesRoutes);
app.use("/api/automotive/workshop", automotiveWorkshopRoutes); // Mounts sales routes like /sales, /calculate-payment
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Facturación Electrónica API is running");
});


const server = app.listen(port as number, "0.0.0.0", async () => {
  try {
    await initDb();
    console.log(`Server is running on port ${port} and accessible via network (0.0.0.0)`);
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
});

const shutdown = (signal: string) => {
  console.log(`Received ${signal}. Closing server...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
