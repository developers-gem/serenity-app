const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    anonHandle: {
      type: String,
      unique: true,
      index: true,
      match: /^anon-[a-f0-9]{8}$/,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    notificationPrefs: {
      dailyCheckInReminders: {
        type: Boolean,
        default: true,
      },
      sessionReminders: {
        type: Boolean,
        default: true,
      },
      sageFollowUps: {
        type: Boolean,
        default: true,
      },
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);