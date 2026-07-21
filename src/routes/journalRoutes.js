const express = require('express');
const { listEntries, createEntry, deleteEntry } = require('../controllers/journalController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', listEntries);
router.post('/', createEntry);
router.delete('/:id', deleteEntry);

module.exports = router;
