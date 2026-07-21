const Therapist = require('../models/Therapist');

function serialize(t) {
  return {
    id: t._id.toString(),
    name: t.name,
    specialty: t.specialty,
    pricePerSession: t.pricePerSession,
    bio: t.bio,
    languages: t.languages,
    approaches: t.approaches,
    rating: t.rating,
    yearsExperience: t.yearsExperience,
  };
}

const asyncHandler = require('../middleware/asyncHandler');

/**
 * GET /api/therapists?specialty=
 * Public directory data — matches the Flutter TherapistService.list().
 */
const listTherapists = asyncHandler(async (req, res) => {
  const { specialty } = req.query;
  const filter = { isActive: true };
  if (specialty && specialty !== 'All') filter.specialty = specialty;

  const therapists = await Therapist.find(filter).sort({ name: 1 }).lean();
  res.json(therapists.map(serialize));
});

module.exports = { listTherapists };
