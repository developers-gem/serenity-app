require('dotenv').config();

/**
 * Centralized, validated environment access. Import this instead of
 * reading process.env directly elsewhere so missing config fails fast
 * and loudly at boot rather than as a mystery 500 later.
 */
const required = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Warning: ${key} is not set. The app may not function correctly.`);
  }
}

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || '*',

  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/serenity',

  jwtSecret: process.env.JWT_SECRET || 'dev_only_insecure_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '90d',

  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  claudeModel: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',

  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceMonthly: process.env.STRIPE_PRICE_MONTHLY,
  stripePriceYearly: process.env.STRIPE_PRICE_YEARLY,
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5000/billing/success',
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:5000/billing/cancel',
};
