const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const env = require("../config/env");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const generateUniqueHandle = require("../utils/generateHandle");
const asyncHandler = require("../middleware/asyncHandler");

function signToken(userId) {
  return jwt.sign(
    { sub: userId },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
    }
  );
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    anonHandle: user.anonHandle,
    createdAt: user.createdAt,
    isPremium: user.isPremium,
  };
}

/**
 * Register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      message: "Email already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const anonHandle = await generateUniqueHandle();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    anonHandle,
  });

  await Subscription.create({
    user: user._id,
  });

  const token = signToken(user._id);

  res.status(201).json({
    user: serializeUser(user),
    token,
  });
});

/**
 * Login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const matched = await bcrypt.compare(
    password,
    user.password
  );

  if (!matched) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  const token = signToken(user._id);

  res.json({
    user: serializeUser(user),
    token,
  });
});

/**
 * Get Logged In User
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({
    user: serializeUser(req.user),
  });
});

module.exports = {
  register,
  login,
  getMe,
  serializeUser,
};