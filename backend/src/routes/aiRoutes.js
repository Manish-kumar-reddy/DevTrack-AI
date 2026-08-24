const express = require("express");
const aiController = require("../controllers/aiController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { studyPlanValidator } = require("../validators/aiValidators");

const router = express.Router();

router.use(authenticate);

router.post("/study-plan", studyPlanValidator, validate, aiController.createStudyPlan);

module.exports = router;
