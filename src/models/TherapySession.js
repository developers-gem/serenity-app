const mongoose = require('mongoose');

const therapySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
    // Denormalized at booking time so the sessions list never needs a
    // join, and so historical sessions still show the correct name/price
    // even if the therapist's live listing changes later.
    therapistName: { type: String, required: true },
    pricePaid: { type: Number, required: true, min: 0 },
    datetime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

therapySessionSchema.index({ user: 1, datetime: 1 });

module.exports = mongoose.model('TherapySession', therapySessionSchema);
