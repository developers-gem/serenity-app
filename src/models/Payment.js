const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 }, // dollars, not cents, for direct display
    description: { type: String, required: true },
    stripePaymentIntentId: { type: String, default: null },
    // What this payment was for — lets Billing show accurate history
    // even as new payment sources (sessions vs subscriptions) are added.
    kind: { type: String, enum: ['subscription', 'session'], required: true },
    relatedSession: { type: mongoose.Schema.Types.ObjectId, ref: 'TherapySession', default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
