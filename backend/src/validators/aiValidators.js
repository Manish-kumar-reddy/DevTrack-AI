const { body } = require("express-validator");

const studyPlanValidator = [
  body("weakTopic").trim().notEmpty().withMessage("weakTopic is required.").isLength({ max: 120 }),
  body("targetCompany").optional({ nullable: true }).trim().isLength({ max: 120 }),
  body("daysRemaining")
    .isInt({ min: 1, max: 365 })
    .withMessage("daysRemaining must be an integer between 1 and 365.")
    .toInt(),
];

module.exports = { studyPlanValidator };
