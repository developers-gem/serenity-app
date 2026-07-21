const mongoose = require('mongoose');
const TherapySession = require('../models/TherapySession');
const Therapist = require('../models/Therapist');
const Payment = require('../models/Payment');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');

function serialize(s) {
  return {
    id: s._id.toString(),
    therapistName: s.therapistName,
    datetime: s.datetime,
    status: s.status,
  };
}

/**
 * GET /api/sessions
 */
const listSessions = asyncHandler(async (req, res) => {
  const sessions = await TherapySession.find({ user: req.user._id }).sort({ datetime: 1 }).lean();
  res.json(sessions.map(serialize));
});

/**
 * POST /api/sessions
 * Body: { therapistId, datetime }
 *
 * NOTE: this endpoint books the session and records a matching Payment
 * (test-mode). If you want session bookings to go through Stripe
 * Checkout the same way subscriptions do, swap the immediate Payment
 * creation for a checkout session + webhook confirmation instead.
 */
const bookSession = asyncHandler(async (req, res) => {
  const { therapistId, datetime } = req.body;
  if (!therapistId || !datetime) {
    throw new ApiError(400, 'therapistId and datetime are required.');
  }
  if (!mongoose.Types.ObjectId.isValid(therapistId)) {
    throw new ApiError(400, 'therapistId is not valid.');
  }

  const therapist = await Therapist.findById(therapistId);
  if (!therapist || !therapist.isActive) {
    throw new ApiError(404, 'Therapist not found.');
  }

  const parsedDate = new Date(datetime);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate < new Date()) {
    throw new ApiError(400, 'datetime must be a valid future date.');
  }

  const session = await TherapySession.create({
    user: req.user._id,
    therapist: therapist._id,
    therapistName: therapist.name,
    pricePaid: therapist.pricePerSession,
    datetime: parsedDate,
    status: 'scheduled',
  });

  await Payment.create({
    user: req.user._id,
    amount: therapist.pricePerSession,
    description: `Session with ${therapist.name}`,
    kind: 'session',
    relatedSession: session._id,
  });

  res.status(201).json(serialize(session));
});

module.exports = { listSessions, bookSession };
