const MoodEntry = require('../models/MoodEntry');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');

function serialize(entry) {
  return {
    id: entry._id.toString(),
    score: entry.score,
    tags: entry.tags,
    note: entry.note,
    createdAt: entry.createdAt,
  };
}

/**
 * POST /api/mood
 * Body: { score, tags, note }
 */
const logMood = asyncHandler(async (req, res) => {
  const { score, tags, note } = req.body;
  if (typeof score !== 'number' || score < 1 || score > 10) {
    throw new ApiError(400, 'score must be a number between 1 and 10.');
  }

  const entry = await MoodEntry.create({
    user: req.user._id,
    score,
    tags: Array.isArray(tags) ? tags : [],
    note: note || null,
  });

  res.status(201).json(serialize(entry));
});

/**
 * GET /api/mood?limit=30
 */
const getRecentEntries = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
  const entries = await MoodEntry.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  res.json(entries.map(serialize));
});

/**
 * GET /api/mood/latest
 */
const getLatestEntry = asyncHandler(async (req, res) => {
  const entry = await MoodEntry.findOne({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  if (!entry) return res.status(204).send();
  res.json(serialize(entry));
});

module.exports = { logMood, getRecentEntries, getLatestEntry };
