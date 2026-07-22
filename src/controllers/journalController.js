const Journal = require("../models/Journal");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * POST /api/journal
 * Create Journal
 */
const createJournal = asyncHandler(async (req, res) => {
  const { title, content, mood, tags } = req.body;

  const journal = await Journal.create({
    user: req.user._id,
    title,
    content,
    mood,
    tags,
  });

  res.status(201).json({
    success: true,
    message: "Journal created successfully.",
    data: journal,
  });
});

/**
 * GET /api/journal
 * Get All Journals
 */
const getAllJournals = asyncHandler(async (req, res) => {
  const journals = await Journal.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: journals.length,
    data: journals,
  });
});

/**
 * GET /api/journal/:id
 * Get Journal By ID
 */
const getJournalById = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!journal) {
    return res.status(404).json({
      success: false,
      message: "Journal not found.",
    });
  }

  res.json({
    success: true,
    data: journal,
  });
});

/**
 * PUT /api/journal/:id
 * Update Journal
 */
const updateJournal = asyncHandler(async (req, res) => {
  const { title, content, mood, tags } = req.body;

  const journal = await Journal.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id,
    },
    {
      title,
      content,
      mood,
      tags,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!journal) {
    return res.status(404).json({
      success: false,
      message: "Journal not found.",
    });
  }

  res.json({
    success: true,
    message: "Journal updated successfully.",
    data: journal,
  });
});

/**
 * DELETE /api/journal/:id
 * Delete Journal
 */
const deleteJournal = asyncHandler(async (req, res) => {
  const journal = await Journal.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!journal) {
    return res.status(404).json({
      success: false,
      message: "Journal not found.",
    });
  }

  res.json({
    success: true,
    message: "Journal deleted successfully.",
  });
});

module.exports = {
  createJournal,
  getAllJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
};