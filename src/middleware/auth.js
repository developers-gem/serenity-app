const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { ApiError } = require('./errorHandler');
const asyncHandler = require('./asyncHandler');

/**
 * Requires a valid Bearer JWT and attaches the corresponding anonymous
 * user to req.user. This is the ONLY notion of "identity" in Serenity —
 * there is no email/password account system, by design (see product
 * scope: anonymous handles are the identity).
 */
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Missing or malformed Authorization header.');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired session token.');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new ApiError(401, 'Session user no longer exists.');
  }

  req.user = user;
  next();
});

module.exports = { requireAuth };
