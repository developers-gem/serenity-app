const mongoose = require('mongoose');

/**
 * Therapist directory entries. This is reference/catalog data managed
 * by admins (via the seed script or an internal tool), not user-owned.
 */
const therapistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: { type: String, required: true, index: true },
    pricePerSession: { type: Number, required: true, min: 0 },
    bio: { type: String, required: true, maxlength: 2000 },
    languages: [{ type: String }],
    approaches: [{ type: String }], // e.g. "CBT", "EMDR", "ACT"
    rating: { type: Number, min: 0, max: 5, default: 4.8 },
    yearsExperience: { type: Number, min: 0, default: 5 },
    isActive: { type: Boolean, default: true }, // soft-delete / hide from directory
  },
  { timestamps: true }
);

therapistSchema.index({ isActive: 1, specialty: 1 });

module.exports = mongoose.model('Therapist', therapistSchema);
