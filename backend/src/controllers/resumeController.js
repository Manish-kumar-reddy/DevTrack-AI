const { fn, col } = require("sequelize");
const { Problem, Contest } = require("../models");
const asyncHandler = require("../utils/asyncHandler");

const getResumeSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [byPlatformRaw, byTopicRaw, difficultyRaw, totalSolved, contests] = await Promise.all([
    Problem.findAll({
      where: { userId, status: "Solved" },
      attributes: ["platform", [fn("COUNT", col("id")), "count"]],
      group: ["platform"],
      raw: true,
    }),
    Problem.findAll({
      where: { userId, status: "Solved" },
      attributes: ["topic", [fn("COUNT", col("id")), "count"]],
      group: ["topic"],
      order: [[fn("COUNT", col("id")), "DESC"]],
      limit: 3,
      raw: true,
    }),
    Problem.findAll({
      where: { userId, status: "Solved" },
      attributes: ["difficulty", [fn("COUNT", col("id")), "count"]],
      group: ["difficulty"],
      raw: true,
    }),
    Problem.count({ where: { userId, status: "Solved" } }),
    Contest.findAll({ where: { userId }, attributes: ["platform", "rating"], raw: true }),
  ]);

  const byPlatform = byPlatformRaw.map((r) => ({ platform: r.platform, count: parseInt(r.count, 10) }));
  const strongestTopics = byTopicRaw.map((r) => r.topic);
  const difficultyBreakdown = { Easy: 0, Medium: 0, Hard: 0 };
  for (const row of difficultyRaw) {
    difficultyBreakdown[row.difficulty] = parseInt(row.count, 10);
  }

  const bestRatingByPlatform = {};
  for (const c of contests) {
    if (c.rating === null || c.rating === undefined) continue;
    if (!bestRatingByPlatform[c.platform] || c.rating > bestRatingByPlatform[c.platform]) {
      bestRatingByPlatform[c.platform] = c.rating;
    }
  }

  const platformClause = byPlatform
    .sort((a, b) => b.count - a.count)
    .map((p) => `${p.count} ${p.platform}`)
    .join(", ");
  const topicClause = strongestTopics.length > 0 ? `strongest in ${strongestTopics.join(" & ")}` : null;
  const generatedText = [platformClause, topicClause].filter(Boolean).join(", ") + ".";

  res.json({
    data: {
      totalSolved,
      byPlatform,
      strongestTopics,
      difficultyBreakdown,
      bestRatingByPlatform,
      contestsCount: contests.length,
      generatedText: totalSolved > 0 ? generatedText : "Start solving problems to generate your resume summary.",
    },
  });
});

module.exports = { getResumeSummary };
