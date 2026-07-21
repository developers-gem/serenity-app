const mongoose = require('mongoose');

const MOOD_TAGS = [
  'calm', 'anxious', 'sad', 'angry', 'hopeful',
  'tired', 'lonely', 'grateful', 'numb', 'overwhelmed',
];

const moodEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 1, max: 10 },
    tags: [{ type: String, enum: MOOD_TAGS }],
    note: { type: String, maxlength: 2000, default: null },
  },
  { timestamps: true }
);

// Fast "recent entries for user" and "latest entry for user" queries.
moodEntrySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
module.exports.MOOD_TAGS = MOOD_TAGS;
