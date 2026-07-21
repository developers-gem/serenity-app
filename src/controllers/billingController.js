const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const TherapySession = require('../models/TherapySession');
const User = require('../models/User');
const { createCheckoutSession, constructWebhookEvent } = require('../services/stripeService');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * GET /api/billing/summary
 * Aggregates everything the Billing screen needs in one call.
 */
const getSummary = asyncHandler(async (req, res) => {
  const [subscription, payments, invoices, sessionCount, paidSessionCount] = await Promise.all([
    Subscription.findOne({ user: req.user._id }).lean(),
    Payment.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    Invoice.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    TherapySession.countDocuments({ user: req.user._id }),
    Payment.countDocuments({ user: req.user._id, kind: 'session' }),
  ]);

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    plan: subscription?.status === 'active' ? subscription.plan : 'none',
    totalSpent,
    sessionsBooked: sessionCount,
    sessionsPaid: paidSessionCount,
    payments: payments.map((p) => ({
      id: p._id.toString(),
      amount: p.amount,
      description: p.description,
      createdAt: p.createdAt,
    })),
    invoices: invoices.map((i) => ({
      id: i._id.toString(),
      url: i.url,
      createdAt: i.createdAt,
    })),
  });
});

/**
 * POST /api/billing/checkout
 * Body: { plan: 'monthly' | 'yearly' }
 * Returns a Stripe Checkout URL for the client to open externally.
 */
const startCheckout = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  if (!['monthly', 'yearly'].includes(plan)) {
    throw new ApiError(400, 'plan must be "monthly" or "yearly".');
  }

  const url = await createCheckoutSession({ user: req.user, plan });
  res.json({ url });
});

/**
 * POST /api/webhooks/stripe
 * Must be mounted with the raw body parser (see routes/billingRoutes.js) —
 * Stripe signature verification requires the unparsed request body.
 */
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    throw new ApiError(400, `Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const { userId, plan } = session.metadata || {};
      if (userId) {
        await Subscription.findOneAndUpdate(
          { user: userId },
          {
            plan: plan || 'monthly',
            status: 'active',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          },
          { upsert: true }
        );
        await User.findByIdAndUpdate(userId, { isPremium: true });
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      const subscription = await Subscription.findOne({ stripeCustomerId: invoice.customer });
      if (subscription) {
        await Invoice.create({
          user: subscription.user,
          stripeInvoiceId: invoice.id,
          url: invoice.hosted_invoice_url,
          amount: (invoice.amount_paid || 0) / 100,
        });
        await Payment.create({
          user: subscription.user,
          amount: (invoice.amount_paid || 0) / 100,
          description: 'Serenity Premium subscription',
          kind: 'subscription',
        });
        subscription.currentPeriodEnd = new Date(invoice.lines.data[0]?.period?.end * 1000);
        await subscription.save();
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object;
      const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
      if (subscription) {
        subscription.status = 'canceled';
        subscription.plan = 'none';
        await subscription.save();
        await User.findByIdAndUpdate(subscription.user, { isPremium: false });
      }
      break;
    }

    default:
      // Unhandled event types are fine to ignore.
      break;
  }

  res.json({ received: true });
});

module.exports = { getSummary, startCheckout, handleStripeWebhook };
