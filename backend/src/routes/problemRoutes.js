const express = require("express");
const problemController = require("../controllers/problemController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  createProblemValidator,
  updateProblemValidator,
  idParamValidator,
  listProblemsValidator,
} = require("../validators/problemValidators");

const router = express.Router();

router.use(authenticate);

router.get("/", listProblemsValidator, validate, problemController.listProblems);
router.post("/", createProblemValidator, validate, problemController.createProblem);
router.get("/:id", idParamValidator, validate, problemController.getProblem);
router.put("/:id", updateProblemValidator, validate, problemController.updateProblem);
router.delete("/:id", idParamValidator, validate, problemController.deleteProblem);
router.post("/:id/favorite", idParamValidator, validate, problemController.toggleFavorite);

module.exports = router;
