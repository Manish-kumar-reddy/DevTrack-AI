const { body } = require("express-validator");

const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 120 }),
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),
];

const loginValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

const updateProfileValidator = [
  body("name").optional().trim().notEmpty().isLength({ max: 120 }),
  body("targetCompany").optional({ nullable: true }).trim().isLength({ max: 120 }),
  body("bio").optional({ nullable: true }).trim().isLength({ max: 500 }),
];

const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required."),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long."),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
};
