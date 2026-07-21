const express = require('express');
const { listSessions, bookSession } = require('../controllers/sessionController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', listSessions);
router.post('/', bookSession);

module.exports = router;
