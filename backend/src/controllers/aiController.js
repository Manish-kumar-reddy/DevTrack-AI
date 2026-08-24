const { generateStudyPlan } = require("../services/studyPlanService");
const asyncHandler = require("../utils/asyncHandler");

const createStudyPlan = asyncHandler(async (req, res) => {
  const { weakTopic, targetCompany, daysRemaining } = req.body;
  const plan = generateStudyPlan({ weakTopic, targetCompany, daysRemaining });
  res.json({ data: plan });
});

module.exports = { createStudyPlan };
