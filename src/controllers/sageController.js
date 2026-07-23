const asyncHandler = require("../middleware/asyncHandler");

const { generateReply } = require("../services/openaiService");

const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: "Message is required",
    });
  }

  const reply = await generateReply(message);

  res.json({
    success: true,
    reply,
  });
});

module.exports = {
  chat,
};