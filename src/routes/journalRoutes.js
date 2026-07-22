const express = require("express");

const {
  createJournal,
  getAllJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
} = require("../controllers/journalController");

const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, createJournal);

router.get("/", requireAuth, getAllJournals);

router.get("/:id", requireAuth, getJournalById);

router.put("/:id", requireAuth, updateJournal);

router.delete("/:id", requireAuth, deleteJournal);

module.exports = router;