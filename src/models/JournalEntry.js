const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, maxlength: 200, default: 'Untitled entry' },
    body: { type: String, required: true, maxlength: 20000 },
    // Optional link to how the user was feeling when they wrote this —
    // lets the Journal list show a mood emoji without a second lookup.
    moodScore: { type: Number, min: 1, max: 10, default: null },
  },
  { timestamps: true }
);

journalEntrySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
