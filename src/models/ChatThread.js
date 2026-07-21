const mongoose = require('mongoose');

/**
 * A Sage conversation thread. Kept separate from ChatMessage so the
 * Sage "threads" list screen can query cheaply (title + preview +
 * updatedAt) without pulling every message in every conversation.
 */
const chatThreadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // The Flutter client generates its own thread id (e.g. "thread-<timestamp>")
    // when starting a conversation. We store it so the client never needs to
    // learn a server-assigned id — it can keep using the one it created.
    clientThreadId: { type: String, required: true },
    title: { type: String, default: 'Conversation' },
    preview: { type: String, default: '' }, // snippet of the last message
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatThreadSchema.index({ user: 1, lastMessageAt: -1 });
chatThreadSchema.index({ user: 1, clientThreadId: 1 }, { unique: true });

module.exports = mongoose.model('ChatThread', chatThreadSchema);
