const { listAchievementsForUser } = require("../services/achievementService");
const asyncHandler = require("../utils/asyncHandler");

const listAchievements = asyncHandler(async (req, res) => {
  const achievements = await listAchievementsForUser(req.user.id);
  res.json({ data: achievements });
});

module.exports = { listAchievements };
