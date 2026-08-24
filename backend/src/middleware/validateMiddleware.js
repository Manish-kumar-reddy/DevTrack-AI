const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

/** Runs after an express-validator chain; turns collected errors into a single 400. */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(ApiError.badRequest("Validation failed.", details));
}

module.exports = validate;
