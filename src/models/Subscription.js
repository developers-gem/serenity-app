const mongoose = require('mongoose');

/**
 * One active/most-recent subscription record per user. Kept separate
 * from User so Stripe webhook updates don't need to touch the core
 * identity document, and so subscription history could later become
 * one-to-many without a schema migration.
 */
const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    plan: { type: String, enum: ['none', 'monthly', 'yearly'], default: 'none' },
    status: {
      type: String,
      enum: ['inactive', 'active', 'past_due', 'canceled'],
      default: 'inactive',
    },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
