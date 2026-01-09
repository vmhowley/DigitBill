import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia" as any, // Use latest or a stable version
});

export const STRIPE_PRICES = {
  entrepreneur: {
    month: process.env.STRIPE_PRICE_ENTREPRENEUR || "",
    year: process.env.STRIPE_PRICE_ENTREPRENEUR_YEAR || "",
  },
  pyme: {
    month: process.env.STRIPE_PRICE_PYME || "",
    year: process.env.STRIPE_PRICE_PYME_YEAR || "",
  },
  enterprise: {
    month: process.env.STRIPE_PRICE_ENTERPRISE || "",
    year: process.env.STRIPE_PRICE_ENTERPRISE_YEAR || "",
  },
};

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
