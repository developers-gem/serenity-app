const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    mood: {
      type: String,
      enum: [
        "Happy",
        "Calm",
        "Excited",
        "Neutral",
        "Sad",
        "Anxious",
        "Angry",
        "Stressed",
      ],
      default: null,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Journal", journalSchema);