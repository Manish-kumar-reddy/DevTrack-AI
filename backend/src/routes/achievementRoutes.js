const express = require("express");
const achievementController = require("../controllers/achievementController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", achievementController.listAchievements);

module.exports = router;
