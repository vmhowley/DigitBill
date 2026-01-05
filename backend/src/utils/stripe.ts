import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any, // Use latest or a stable version
});

export const STRIPE_PRICES = {
  entrepreneur: process.env.STRIPE_PRICE_ENTREPRENEUR || '',
  pyme: process.env.STRIPE_PRICE_PYME || '',
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || '',
};

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
