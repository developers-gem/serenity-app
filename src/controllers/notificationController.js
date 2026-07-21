const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

function serialize(n) {
  return {
    id: n._id.toString(),
    title: n.title,
    body: n.body,
    icon: n.icon,
    read: n.read,
    createdAt: n.createdAt,
  };
}

/**
 * GET /api/notifications
 */
const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(notifications.map(serialize));
});

/**
 * POST /api/notifications/read-all
 * Marks all of the user's notifications as read — mirrors the Flutter
 * NotificationsScreen calling markNotificationsRead() on open.
 */
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.status(204).send();
});

module.exports = { listNotifications, markAllRead };
