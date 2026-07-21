const mongoose = require('mongoose');
const ChatThread = require('../models/ChatThread');
const ChatMessage = require('../models/ChatMessage');
const { getSageReply } = require('../services/claudeService');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');

const MAX_HISTORY_MESSAGES = 20; // keep Claude calls bounded

function truncate(str, len) {
  return str.length > len ? `${str.slice(0, len - 1)}…` : str;
}

/**
 * POST /api/sage/message
 * Body: { threadId, message }
 *
 * threadId is a client-generated string (see Flutter's SageChatScreen).
 * On first message in a thread, we create the ChatThread lazily here
 * rather than requiring a separate "start thread" call.
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { threadId, message } = req.body;
  if (!threadId || !message || !message.trim()) {
    throw new ApiError(400, 'threadId and message are required.');
  }

  let thread = await ChatThread.findOne({ user: req.user._id, clientThreadId: threadId });
  if (!thread) {
    thread = await ChatThread.create({
      user: req.user._id,
      clientThreadId: threadId,
      title: truncate(message.trim(), 60),
      preview: truncate(message.trim(), 120),
      lastMessageAt: new Date(),
    });
  }

  await ChatMessage.create({ thread: thread._id, user: req.user._id, role: 'user', content: message });

  const priorMessages = await ChatMessage.find({ thread: thread._id })
    .sort({ createdAt: 1 })
    .limit(MAX_HISTORY_MESSAGES)
    .lean();

  const replyText = await getSageReply(
    priorMessages.map((m) => ({ role: m.role, content: m.content }))
  );

  const replyDoc = await ChatMessage.create({
    thread: thread._id,
    user: req.user._id,
    role: 'assistant',
    content: replyText,
  });

  thread.preview = truncate(replyText, 120);
  thread.lastMessageAt = new Date();
  await thread.save();

  res.status(201).json({
    reply: {
      id: replyDoc._id.toString(),
      role: replyDoc.role,
      content: replyDoc.content,
      createdAt: replyDoc.createdAt,
    },
  });
});

/**
 * GET /api/sage/history?threadId=
 */
const getHistory = asyncHandler(async (req, res) => {
  const { threadId } = req.query;
  if (!threadId) throw new ApiError(400, 'threadId query param is required.');

  const thread = await ChatThread.findOne({ user: req.user._id, clientThreadId: threadId });
  if (!thread) return res.json([]);

  const messages = await ChatMessage.find({ thread: thread._id }).sort({ createdAt: 1 }).lean();
  res.json(
    messages.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }))
  );
});

/**
 * GET /api/sage/threads
 */
const getThreads = asyncHandler(async (req, res) => {
  const threads = await ChatThread.find({ user: req.user._id }).sort({ lastMessageAt: -1 }).lean();
  res.json(
    threads.map((t) => ({
      id: t.clientThreadId,
      title: t.title,
      preview: t.preview,
      updatedAt: t.lastMessageAt,
    }))
  );
});

module.exports = { sendMessage, getHistory, getThreads };
