const express = require("express");
const contestController = require("../controllers/contestController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  createContestValidator,
  updateContestValidator,
  idParamValidator,
  listContestsValidator,
} = require("../validators/contestValidators");

const router = express.Router();

router.use(authenticate);

router.get("/", listContestsValidator, validate, contestController.listContests);
router.get("/rating-history", contestController.ratingHistory);
router.post("/", createContestValidator, validate, contestController.createContest);
router.get("/:id", idParamValidator, validate, contestController.getContest);
router.put("/:id", updateContestValidator, validate, contestController.updateContest);
router.delete("/:id", idParamValidator, validate, contestController.deleteContest);

module.exports = router;
