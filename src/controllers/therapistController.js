const asyncHandler = require("../middleware/asyncHandler");
const {
  searchTherapists,
  getTherapistDetails,
} = require("../services/googlePlacesService");

const search = asyncHandler(async (req, res) => {
  const { query, lat, lng, radius } = req.query;

  if (!query || !lat || !lng) {
    return res.status(400).json({
      success: false,
      message: "query, lat and lng are required",
    });
  }

  const places = await searchTherapists(
    query,
    lat,
    lng,
    radius
  );

  res.json({
    success: true,
    count: places.length,
    data: places,
  });
});

const details = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  const therapist = await getTherapistDetails(placeId);

  res.json({
    success: true,
    data: therapist,
  });
});

module.exports = {
  search,
    details,

};