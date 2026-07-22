const express = require("express");

const {
  createMood,
  getAllMoods,
  getMoodById,
  updateMood,
  deleteMood,
} = require("../controllers/moodController");

const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, createMood);

router.get("/", requireAuth, getAllMoods);

router.get("/:id", requireAuth, getMoodById);

router.put("/:id", requireAuth, updateMood);

router.delete("/:id", requireAuth, deleteMood);

module.exports = router;