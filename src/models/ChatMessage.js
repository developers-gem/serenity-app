const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatThread', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 8000 },
  },
  { timestamps: true }
);

chatMessageSchema.index({ thread: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
