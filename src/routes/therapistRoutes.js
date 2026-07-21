const express = require('express');
const { listTherapists } = require('../controllers/therapistController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Directory browsing doesn't strictly need auth, but we require it anyway
// to keep the app's data plane consistently anonymous-session-gated.
router.get('/', requireAuth, listTherapists);

module.exports = router;
