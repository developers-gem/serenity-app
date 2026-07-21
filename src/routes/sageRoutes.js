const express = require('express');
const { sendMessage, getHistory, getThreads } = require('../controllers/sageController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.post('/message', sendMessage);
router.get('/history', getHistory);
router.get('/threads', getThreads);

module.exports = router;
