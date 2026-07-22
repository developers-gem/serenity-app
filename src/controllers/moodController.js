const Mood = require("../models/Mood");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * POST /api/mood
 * Create Mood
 */
const createMood = asyncHandler(async (req, res) => {
  const { mood, intensity, note } = req.body;

  const newMood = await Mood.create({
    user: req.user._id,
    mood,
    intensity,
    note,
  });

  res.status(201).json({
    success: true,
    message: "Mood added successfully.",
    data: newMood,
  });
});

/**
 * GET /api/mood
 * Get All Mood Logs
 */
const getAllMoods = asyncHandler(async (req, res) => {
  const moods = await Mood.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: moods.length,
    data: moods,
  });
});

/**
 * GET /api/mood/:id
 * Get Single Mood
 */
const getMoodById = asyncHandler(async (req, res) => {
  const mood = await Mood.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!mood) {
    return res.status(404).json({
      success: false,
      message: "Mood not found.",
    });
  }

  res.json({
    success: true,
    data: mood,
  });
});

/**
 * PUT /api/mood/:id
 * Update Mood
 */
const updateMood = asyncHandler(async (req, res) => {
  const { mood, intensity, note } = req.body;

  const updatedMood = await Mood.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    {
      mood,
      intensity,
      note,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedMood) {
    return res.status(404).json({
      success: false,
      message: "Mood not found.",
    });
  }

  res.json({
    success: true,
    message: "Mood updated successfully.",
    data: updatedMood,
  });
});

/**
 * DELETE /api/mood/:id
 * Delete Mood
 */
const deleteMood = asyncHandler(async (req, res) => {
  const deletedMood = await Mood.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!deletedMood) {
    return res.status(404).json({
      success: false,
      message: "Mood not found.",
    });
  }

  res.json({
    success: true,
    message: "Mood deleted successfully.",
  });
});

module.exports = {
  createMood,
  getAllMoods,
  getMoodById,
  updateMood,
  deleteMood,
};