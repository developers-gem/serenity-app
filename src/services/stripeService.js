const Stripe = require('stripe');
const env = require('../config/env');

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

function assertConfigured() {
  if (!stripe) {
    throw new Error('STRIPE_SECRET_KEY is not configured on the server.');
  }
}

async function getOrCreateCustomer(user) {
  assertConfigured();
  const Subscription = require('../models/Subscription');
  const existing = await Subscription.findOne({ user: user._id });

  if (existing && existing.stripeCustomerId) {
    return existing.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    // No PII available or desired — tag with the anon handle only.
    metadata: { anonHandle: user.anonHandle, userId: user._id.toString() },
  });

  return customer.id;
}

async function createCheckoutSession({ user, plan }) {
  assertConfigured();
  const priceId = plan === 'yearly' ? env.stripePriceYearly : env.stripePriceMonthly;
  if (!priceId) {
    throw new Error(`No Stripe price configured for plan "${plan}".`);
  }

  const customerId = await getOrCreateCustomer(user);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: env.stripeSuccessUrl,
    cancel_url: env.stripeCancelUrl,
    metadata: { userId: user._id.toString(), plan },
  });

  return session.url;
}

function constructWebhookEvent(rawBody, signature) {
  assertConfigured();
  return stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
}

module.exports = { stripe, createCheckoutSession, constructWebhookEvent, getOrCreateCustomer };
