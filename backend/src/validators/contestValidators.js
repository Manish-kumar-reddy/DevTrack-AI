const { body, param, query } = require("express-validator");
const Contest = require("../models/Contest");

const createContestValidator = [
  body("name").trim().notEmpty().withMessage("Contest name is required.").isLength({ max: 255 }),
  body("platform").isIn(Contest.PLATFORMS).withMessage(`Platform must be one of: ${Contest.PLATFORMS.join(", ")}`),
  body("contestDate").isISO8601().withMessage("contestDate must be a valid date."),
  body("rating").optional({ nullable: true }).isInt().toInt(),
  body("rank").optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body("problemsSolved").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
];

const updateContestValidator = [
  param("id").isInt({ min: 1 }).toInt(),
  body("name").optional().trim().notEmpty().isLength({ max: 255 }),
  body("platform").optional().isIn(Contest.PLATFORMS),
  body("contestDate").optional().isISO8601(),
  body("rating").optional({ nullable: true }).isInt().toInt(),
  body("rank").optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body("problemsSolved").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
];

const idParamValidator = [param("id").isInt({ min: 1 }).toInt()];

const listContestsValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("platform").optional().isIn(Contest.PLATFORMS),
  query("sortBy").optional().isIn(["contestDate", "rating", "rank", "createdAt"]),
  query("sortOrder").optional().isIn(["asc", "desc", "ASC", "DESC"]),
];

module.exports = { createContestValidator, updateContestValidator, idParamValidator, listContestsValidator };
