const express = require("express");
const goalController = require("../controllers/goalController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { createGoalValidator, updateGoalValidator, idParamValidator } = require("../validators/goalValidators");

const router = express.Router();

router.use(authenticate);

router.get("/", goalController.listGoals);
router.post("/", createGoalValidator, validate, goalController.createGoal);
router.get("/:id", idParamValidator, validate, goalController.getGoal);
router.put("/:id", updateGoalValidator, validate, goalController.updateGoal);
router.delete("/:id", idParamValidator, validate, goalController.deleteGoal);

module.exports = router;
