const express = require("express");

const router = express.Router();

const { requireAuth } = require("../middleware/auth");

const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

router.use(requireAuth);

router.post("/", createNotification);

router.get("/", getNotifications);

router.put("/:id/read", markAsRead);

router.delete("/:id", deleteNotification);

module.exports = router;