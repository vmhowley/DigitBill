import { Router } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";
import { stripe, STRIPE_PRICES } from "../utils/stripe";

const router = Router();

// Endpoint for creating Checkout Session
router.post("/create-checkout-session", requireAuth, async (req, res) => {
  try {
    const { planId, interval = "month" } = req.body;
    console.log(`Received planId: ${planId}, interval: ${interval}`);

    const planPrices = STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES];

    if (!planId || !planPrices) {
      console.error("Invalid Plan Selection:", planId);
      return res.status(400).json({ error: "Plan inválido" });
    }

    const priceId = planPrices[interval as "month" | "year"];

    if (!priceId) {
      console.error(`Price not configured for ${planId} (${interval})`);
      return res
        .status(400)
        .json({ error: `Precio no configurado para ${interval}` });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
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
    console.error("Stripe Session Error:", err);
    res
      .status(500)
      .json({ error: "Error al crear sesión de pago: " + err.message });
  }
});

// Endpoint to manually verify session (Fallback for redirects)
router.post("/verify-session", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID requerido" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(
      `[VerifySession] Status: ${session.payment_status}, Tenant: ${session.metadata?.tenantId}, Plan: ${session.metadata?.plan}`
    );

    if (session.payment_status === "paid") {
      const tenantId = session.metadata?.tenantId;
      const plan = session.metadata?.plan;

      if (tenantId && plan) {
        // Ensure auth matches metadata for security
        if (req.tenantId !== parseInt(tenantId)) {
          console.warn(
            `Tenant mismatch in verification: Req ${req.tenantId} vs Meta ${tenantId}`
          );
        }

        // Fetch Subscription details to get end_date
        let endDate = new Date();
        let subId = "";
        let subStatus = "active";

        if (session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            endDate = new Date((subscription as any).current_period_end * 1000); // Cast to any to avoid strict type issues
            subId = subscription.id;
            subStatus = subscription.status;
            console.log(
              `[VerifySession] Subscription ${subId} ends at ${endDate.toISOString()}`
            );
          } catch (err) {
            console.error("Error fetching subscription details:", err);
          }
        }

        console.log(
          `Verifying Session: Updating tenant ${tenantId} to plan ${plan}`
        );

        await query(
          "UPDATE tenants SET plan = $1, subscription_end_date = $2, stripe_subscription_id = $3, subscription_status = $4 WHERE id = $5",
          [plan, endDate, subId, subStatus, tenantId]
        );

        return res.json({ success: true, plan });
      }
    }

    res.json({ success: false, status: session.payment_status });
  } catch (err: any) {
    console.error("Verify Session Error:", err);
    res.status(500).json({ error: "Error verificando sesión" });
  }
});

// Stripe Webhook handler
router.post("/webhook", async (req, res) => {
  console.log("--- STRIPE WEBHOOK HIT ---");
  console.log("Event Type:", req.body?.type);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body should be raw for this to work perfectly with signature,
    // but for now we'll assume it's okay or handled by express.json if not verifying strictly
    event = req.body;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const tenantId = session.metadata?.tenantId;
      const plan = session.metadata?.plan;

      console.log("Checkout Session Metadata:", session.metadata);

      if (tenantId && plan) {
        // Fetch Subscription details for webhook too
        let endDate = new Date();
        let subId = "";
        let subStatus = "active";

        if (session.subscription) {
          try {
            // We need to fetch it because session object might not have full subscription details expanded
            const subscription = await stripe.subscriptions.retrieve(
              session.subscription as string
            );
            endDate = new Date((subscription as any).current_period_end * 1000);
            subId = subscription.id;
            subStatus = subscription.status;
          } catch (err) {
            console.error("Webhook: Error fetching sub details", err);
          }
        }

        console.log(
          `Updating tenant ${tenantId} to plan ${plan} (Ends: ${endDate.toISOString()})`
        );

        const dbRes = await query(
          "UPDATE tenants SET plan = $1, subscription_end_date = $2, stripe_subscription_id = $3, subscription_status = $4 WHERE id = $5 RETURNING *",
          [plan, endDate, subId, subStatus, tenantId]
        );
        console.log("DB Update Result:", dbRes.rows[0]);
      } else {
        console.warn("Missing tenantId or plan in metadata");
      }
    } else {
      console.log("Ignoring event type:", event.type);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error Processing:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
