const express = require('express');
const { handleStripeWebhook } = require('../controllers/billingController');

const router = express.Router();

// Stripe requires the RAW request body (not JSON-parsed) to verify the
// webhook signature, so this route uses express.raw() and is mounted
// in app.js BEFORE the global express.json() middleware runs on it.
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
