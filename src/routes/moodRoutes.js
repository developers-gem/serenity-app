const express = require('express');
const { logMood, getRecentEntries, getLatestEntry } = require('../controllers/moodController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.post('/', logMood);
router.get('/latest', getLatestEntry); // must come before "/:something" style routes
router.get('/', getRecentEntries);

module.exports = router;
