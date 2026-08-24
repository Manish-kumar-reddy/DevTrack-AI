const express = require("express");
const { param } = require("express-validator");
const revisionController = require("../controllers/revisionController");
const { authenticate } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/today", revisionController.getTodaysRevisions);
router.get("/upcoming", revisionController.getUpcomingRevisions);
router.patch(
  "/:id/complete",
  [param("id").isInt({ min: 1 }).toInt()],
  validate,
  revisionController.completeRevision
);

module.exports = router;
