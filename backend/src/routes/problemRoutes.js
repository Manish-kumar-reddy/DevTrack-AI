const express = require("express");
const problemController = require("../controllers/problemController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  createProblemValidator,
  updateProblemValidator,
  idParamValidator,
  listProblemsValidator,
  fetchUrlValidator,
  bulkImportValidator,
  upsertNoteValidator,
} = require("../validators/problemValidators");

const router = express.Router();

router.use(authenticate);

// Static/action routes registered before "/:id" so they aren't swallowed by the id param route.
router.post("/fetch", fetchUrlValidator, validate, problemController.fetchProblem);
router.post("/bulk-import", bulkImportValidator, validate, problemController.bulkImportProblems);

router.get("/", listProblemsValidator, validate, problemController.listProblems);
router.post("/", createProblemValidator, validate, problemController.createProblem);
router.get("/:id", idParamValidator, validate, problemController.getProblem);
router.put("/:id", updateProblemValidator, validate, problemController.updateProblem);
router.delete("/:id", idParamValidator, validate, problemController.deleteProblem);
router.post("/:id/favorite", idParamValidator, validate, problemController.toggleFavorite);
router.get("/:id/note", idParamValidator, validate, problemController.getProblemNote);
router.put("/:id/note", upsertNoteValidator, validate, problemController.upsertProblemNote);

module.exports = router;
