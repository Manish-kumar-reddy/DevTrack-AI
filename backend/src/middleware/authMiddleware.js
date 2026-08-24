const jwt = require("jsonwebtoken");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const { User } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Missing or malformed Authorization header.");
  }

  const token = header.slice("Bearer ".length);

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    throw ApiError.unauthorized("Invalid or expired token.");
  }

  const user = await User.findByPk(payload.sub);
  if (!user) {
    throw ApiError.unauthorized("User for this token no longer exists.");
  }

  req.user = user;
  next();
});

module.exports = { authenticate };
