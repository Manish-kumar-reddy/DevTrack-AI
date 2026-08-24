const express = require("express");
const resumeController = require("../controllers/resumeController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/summary", resumeController.getResumeSummary);

module.exports = router;
