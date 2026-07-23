const axios = require("axios");

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const searchTherapists = async (query, lat, lng, radius = 5000) => {
  try {
    const url =
      "https://places.googleapis.com/v1/places:searchText";

    const response = await axios.post(
      url,
      {
        textQuery: query,
        locationBias: {
          circle: {
            center: {
              latitude: Number(lat),
              longitude: Number(lng),
            },
            radius,
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location",
        },
      }
    );

    return response.data.places || [];
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw new Error("Unable to fetch therapists");
  }
};


const getTherapistDetails = async (placeId) => {
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await axios.get(url, {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,location,rating,userRatingCount,nationalPhoneNumber,websiteUri,regularOpeningHours,reviews,googleMapsUri",
      },
    });

    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw new Error("Unable to fetch therapist details");
  }
};
module.exports = {
  searchTherapists,
  getTherapistDetails,
};