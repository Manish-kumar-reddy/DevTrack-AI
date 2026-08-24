const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require("../validators/authValidators");

const router = express.Router();

router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, updateProfileValidator, validate, authController.updateProfile);
router.put(
  "/change-password",
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword
);

module.exports = router;
