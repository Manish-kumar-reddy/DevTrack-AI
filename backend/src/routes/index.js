const express = require("express");

const authRoutes = require("./authRoutes");
const problemRoutes = require("./problemRoutes");
const contestRoutes = require("./contestRoutes");
const goalRoutes = require("./goalRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const aiRoutes = require("./aiRoutes");
const resumeRoutes = require("./resumeRoutes");
const revisionRoutes = require("./revisionRoutes");
const achievementRoutes = require("./achievementRoutes");

const router = express.Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));
router.use("/auth", authRoutes);
router.use("/problems", problemRoutes);
router.use("/contests", contestRoutes);
router.use("/goals", goalRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/ai", aiRoutes);
router.use("/resume", resumeRoutes);
router.use("/revisions", revisionRoutes);
router.use("/achievements", achievementRoutes);

module.exports = router;