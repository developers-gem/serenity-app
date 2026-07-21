const JournalEntry = require('../models/JournalEntry');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');

function serialize(entry) {
  return {
    id: entry._id.toString(),
    title: entry.title,
    body: entry.body,
    moodScore: entry.moodScore,
    createdAt: entry.createdAt,
  };
}

/**
 * GET /api/journal
 */
const listEntries = asyncHandler(async (req, res) => {
  const entries = await JournalEntry.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json(entries.map(serialize));
});

/**
 * POST /api/journal
 * Body: { title, body, moodScore }
 */
const createEntry = asyncHandler(async (req, res) => {
  const { title, body, moodScore } = req.body;
  if (!body || !body.trim()) {
    throw new ApiError(400, 'body is required.');
  }

  const entry = await JournalEntry.create({
    user: req.user._id,
    title: title && title.trim() ? title.trim() : 'Untitled entry',
    body: body.trim(),
    moodScore: typeof moodScore === 'number' ? moodScore : null,
  });

  res.status(201).json(serialize(entry));
});

/**
 * DELETE /api/journal/:id
 */
const deleteEntry = asyncHandler(async (req, res) => {
  const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!entry) throw new ApiError(404, 'Journal entry not found.');
  res.status(204).send();
});

module.exports = { listEntries, createEntry, deleteEntry };
