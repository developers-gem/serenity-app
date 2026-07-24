const asyncHandler = require("../middleware/asyncHandler");
const Notification = require("../models/Notification");

// Create notification
const createNotification = asyncHandler(async (req, res) => {
  const { title, body, type } = req.body;

  const notification = await Notification.create({
    user: req.user._id,
    title,
    body,
    type,
  });

  res.status(201).json({
    success: true,
    data: notification,
  });
});

// Get all notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    {
      isRead: true,
    },
    {
      new: true,
    }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.json({
    success: true,
    data: notification,
  });
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.json({
    success: true,
    message: "Notification deleted successfully",
  });
});

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
};