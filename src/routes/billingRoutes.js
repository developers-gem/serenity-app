const express = require('express');
const { getSummary, startCheckout } = require('../controllers/billingController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', getSummary);
router.post('/checkout', startCheckout);

module.exports = router;
