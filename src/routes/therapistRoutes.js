const express = require("express");

const router = express.Router();

const {
  search,
    details,

} = require("../controllers/therapistController");

const { requireAuth } = require("../middleware/auth");

router.get("/search", requireAuth, search);
router.get("/:placeId", requireAuth, details);

module.exports = router;