const jwt = require("jsonwebtoken");
const { User } = require("../models");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

function issueToken(user) {
  return jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists.");
  }

  const user = await User.create({ name, email, password });
  const token = issueToken(user);

  res.status(201).json({ user: user.toSafeJSON(), token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.verifyPassword(password))) {
    throw ApiError.unauthorized("Invalid email or password.");
  }

  const token = issueToken(user);
  res.json({ user: user.toSafeJSON(), token });
});

const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, targetCompany, bio } = req.body;

  if (name !== undefined) req.user.name = name;
  if (targetCompany !== undefined) req.user.targetCompany = targetCompany;
  if (bio !== undefined) req.user.bio = bio;

  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const valid = await req.user.verifyPassword(currentPassword);
  if (!valid) {
    throw ApiError.badRequest("Current password is incorrect.");
  }

  req.user.password = newPassword;
  await req.user.save();
  res.json({ message: "Password updated successfully." });
});

module.exports = { register, login, getProfile, updateProfile, changePassword };
