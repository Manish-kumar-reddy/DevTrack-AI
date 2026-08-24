const { body, param, query } = require("express-validator");
const Problem = require("../models/Problem");

const createProblemValidator = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 255 }),
  body("platform").isIn(Problem.PLATFORMS).withMessage(`Platform must be one of: ${Problem.PLATFORMS.join(", ")}`),
  body("difficulty")
    .isIn(Problem.DIFFICULTIES)
    .withMessage(`Difficulty must be one of: ${Problem.DIFFICULTIES.join(", ")}`),
  body("topic").trim().notEmpty().withMessage("Topic is required.").isLength({ max: 120 }),
  body("status").optional().isIn(Problem.STATUSES).withMessage(`Status must be one of: ${Problem.STATUSES.join(", ")}`),
  body("notes").optional({ nullable: true }).isString(),
  body("solvedDate").optional({ nullable: true }).isISO8601().withMessage("solvedDate must be a valid date."),
  body("timeSpentMinutes").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
];

const updateProblemValidator = [
  param("id").isInt({ min: 1 }).toInt(),
  body("title").optional().trim().notEmpty().isLength({ max: 255 }),
  body("platform").optional().isIn(Problem.PLATFORMS),
  body("difficulty").optional().isIn(Problem.DIFFICULTIES),
  body("topic").optional().trim().notEmpty().isLength({ max: 120 }),
  body("status").optional().isIn(Problem.STATUSES),
  body("notes").optional({ nullable: true }).isString(),
  body("solvedDate").optional({ nullable: true }).isISO8601(),
  body("timeSpentMinutes").optional({ nullable: true }).isInt({ min: 0 }).toInt(),
];

const idParamValidator = [param("id").isInt({ min: 1 }).toInt()];

const listProblemsValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("platform").optional().isIn(Problem.PLATFORMS),
  query("difficulty").optional().isIn(Problem.DIFFICULTIES),
  query("status").optional().isIn(Problem.STATUSES),
  query("favorite").optional().isBoolean().toBoolean(),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "title", "difficulty", "solvedDate", "timeSpentMinutes", "topic"]),
  query("sortOrder").optional().isIn(["asc", "desc", "ASC", "DESC"]),
];

module.exports = {
  createProblemValidator,
  updateProblemValidator,
  idParamValidator,
  listProblemsValidator,
};
