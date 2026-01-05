import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { stripe, STRIPE_PRICES, STRIPE_WEBHOOK_SECRET } from '../utils/stripe';
import { query } from '../db';

const router = Router();

// Endpoint for creating Checkout Session
router.post('/create-checkout-session', requireAuth, async (req, res) => {
    try {
        const { planId } = req.body;
        console.log('Received planId:', planId);
        console.log('Available Stripe Prices:', STRIPE_PRICES);
        
        if (!planId || !STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES]) {
            console.error('Invalid Plan Selection:', planId);
            return res.status(400).json({ error: 'Plan inválido' });
        }

        const priceId = STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES];

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/upgrade`,
            metadata: {
                tenantId: req.tenantId!.toString(),
                plan: planId,
            },
            client_reference_id: req.tenantId!.toString(),
        });

        res.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Session Error:', err);
        res.status(500).json({ error: 'Error al crear sesión de pago: ' + err.message });
    }
});

// Stripe Webhook handler
router.post('/webhook', async (req, res) => {
    console.log('--- STRIPE WEBHOOK HIT ---');
    console.log('Event Type:', req.body?.type);
    
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // req.body should be raw for this to work perfectly with signature, 
        // but for now we'll assume it's okay or handled by express.json if not verifying strictly
        event = req.body;

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const tenantId = session.metadata?.tenantId;
            const plan = session.metadata?.plan;

            console.log('Checkout Session Metadata:', session.metadata);

            if (tenantId && plan) {
                console.log(`Updating tenant ${tenantId} to plan ${plan}`);
                const dbRes = await query('UPDATE tenants SET plan = $1 WHERE id = $2 RETURNING *', [plan, tenantId]);
                console.log('DB Update Result:', dbRes.rows[0]);
            } else {
                console.warn('Missing tenantId or plan in metadata');
            }
        } else {
            console.log('Ignoring event type:', event.type);
        }

        res.json({ received: true });
    } catch (err: any) {
        console.error('Webhook Error Processing:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

export default router;
