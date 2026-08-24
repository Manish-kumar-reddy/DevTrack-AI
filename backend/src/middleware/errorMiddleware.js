const ApiError = require("../utils/ApiError");

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "A record with this value already exists.",
      details: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation failed.",
      details: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error." });
}

module.exports = { notFoundHandler, errorHandler };
