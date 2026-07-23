const asyncHandler = require("../middleware/asyncHandler");

const Mood = require("../models/Mood");
const Journal = require("../models/Journal");

const dashboard = asyncHandler(async (req, res) => {
  const user = req.user;

  const todayMood = await Mood.findOne({
    user: user._id,
  }).sort({ createdAt: -1 });

  const recentJournal = await Journal.findOne({
    user: user._id,
  }).sort({ createdAt: -1 });

  const totalMoods = await Mood.countDocuments({
    user: user._id,
  });

  const totalJournals = await Journal.countDocuments({
    user: user._id,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
      },

      todayMood,

      recentJournal,

      stats: {
        totalMoods,
        totalJournals,
      },
    },
  });
});

module.exports = {
  dashboard,
};