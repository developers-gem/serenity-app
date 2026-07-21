const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stripeInvoiceId: { type: String, required: true, unique: true },
    url: { type: String, required: true }, // Stripe-hosted invoice PDF/page
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

invoiceSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
