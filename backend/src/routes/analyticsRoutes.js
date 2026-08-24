const express = require("express");
const analyticsController = require("../controllers/analyticsController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/summary", analyticsController.getSummary);
router.get("/charts", analyticsController.getCharts);
router.get("/heatmap", analyticsController.getHeatmap);

module.exports = router;
