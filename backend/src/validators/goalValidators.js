const { body, param } = require("express-validator");
const Goal = require("../models/Goal");

const createGoalValidator = [
  body("period").isIn(Goal.PERIODS).withMessage(`period must be one of: ${Goal.PERIODS.join(", ")}`),
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 255 }),
  body("targetTopic").optional({ nullable: true }).trim().isLength({ max: 120 }),
  body("targetCount").isInt({ min: 1 }).withMessage("targetCount must be a positive integer.").toInt(),
  body("startDate").isISO8601().withMessage("startDate must be a valid date."),
  body("endDate")
    .isISO8601()
    .withMessage("endDate must be a valid date.")
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error("endDate must be on or after startDate.");
      }
      return true;
    }),
];

const updateGoalValidator = [
  param("id").isInt({ min: 1 }).toInt(),
  body("period").optional().isIn(Goal.PERIODS),
  body("title").optional().trim().notEmpty().isLength({ max: 255 }),
  body("targetTopic").optional({ nullable: true }).trim().isLength({ max: 120 }),
  body("targetCount").optional().isInt({ min: 1 }).toInt(),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
];

const idParamValidator = [param("id").isInt({ min: 1 }).toInt()];

module.exports = { createGoalValidator, updateGoalValidator, idParamValidator };
