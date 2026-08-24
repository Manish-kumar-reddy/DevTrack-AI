const { Op, fn, col, literal } = require("sequelize");
const { sequelize, Problem, Contest, Activity, Goal } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { computeCurrentStreak, computeActiveDaysInWindow, toDateOnly } = require("../utils/streak");

const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalSolved, byDifficulty, currentStreak, activeDaysThisWeek, activeDaysTotal, contests] =
    await Promise.all([
      Problem.count({ where: { userId, status: "Solved" } }),
      Problem.findAll({
        where: { userId, status: "Solved" },
        attributes: ["difficulty", [fn("COUNT", col("id")), "count"]],
        group: ["difficulty"],
        raw: true,
      }),
      computeCurrentStreak(userId),
      computeActiveDaysInWindow(userId, 7),
      Activity.count({ where: { userId, problemsSolved: { [Op.gt]: 0 } } }),
      Contest.findAll({ where: { userId }, attributes: ["platform", "rating"], raw: true }),
    ]);

  const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const row of byDifficulty) {
    difficultyCounts[row.difficulty] = parseInt(row.count, 10);
  }

  const today = toDateOnly(new Date());
  const activeGoals = await Goal.findAll({
    where: { userId, startDate: { [Op.lte]: today }, endDate: { [Op.gte]: today } },
  });
  let goalCompletionPercent = null;
  if (activeGoals.length > 0) {
    const percents = await Promise.all(
      activeGoals.map(async (goal) => {
        const where = {
          userId,
          status: "Solved",
          solvedDate: { [Op.between]: [goal.startDate, goal.endDate] },
        };
        if (goal.targetTopic) where.topic = goal.targetTopic;
        const solved = await Problem.count({ where });
        return Math.min(100, (solved / goal.targetCount) * 100);
      })
    );
    goalCompletionPercent = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
  }

  const platformRanking = {};
  for (const c of contests) {
    if (c.rating === null || c.rating === undefined) continue;
    if (!platformRanking[c.platform] || c.rating > platformRanking[c.platform].bestRating) {
      platformRanking[c.platform] = { platform: c.platform, bestRating: c.rating };
    }
  }

  res.json({
    data: {
      totalSolved,
      difficulty: difficultyCounts,
      currentStreak,
      weeklyConsistency: { activeDays: activeDaysThisWeek, totalDays: 7 },
      goalCompletionPercent,
      activeDaysTotal,
      platformRanking: Object.values(platformRanking).sort((a, b) => b.bestRating - a.bestRating),
    },
  });
});

const getCharts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [monthlyTrendRaw, topicDistributionRaw, difficultyBreakdownRaw, platformComparisonRaw, ratingProgression] =
    await Promise.all([
      Problem.findAll({
        where: { userId, status: "Solved", solvedDate: { [Op.not]: null } },
        attributes: [
          [fn("DATE_FORMAT", col("solved_date"), "%Y-%m"), "month"],
          [fn("COUNT", col("id")), "count"],
        ],
        group: [literal("month")],
        order: [literal("month ASC")],
        raw: true,
      }),
      Problem.findAll({
        where: { userId, status: "Solved" },
        attributes: ["topic", [fn("COUNT", col("id")), "count"]],
        group: ["topic"],
        order: [[literal("count"), "DESC"]],
        raw: true,
      }),
      Problem.findAll({
        where: { userId, status: "Solved" },
        attributes: ["difficulty", [fn("COUNT", col("id")), "count"]],
        group: ["difficulty"],
        raw: true,
      }),
      Problem.findAll({
        where: { userId, status: "Solved" },
        attributes: ["platform", [fn("COUNT", col("id")), "count"]],
        group: ["platform"],
        raw: true,
      }),
      Contest.findAll({
        where: { userId },
        attributes: ["contestDate", "rating", "platform", "name"],
        order: [["contestDate", "ASC"]],
        raw: true,
      }),
    ]);

  res.json({
    data: {
      monthlyTrend: monthlyTrendRaw.map((r) => ({ month: r.month, count: parseInt(r.count, 10) })),
      topicDistribution: topicDistributionRaw.map((r) => ({ topic: r.topic, count: parseInt(r.count, 10) })),
      difficultyBreakdown: difficultyBreakdownRaw.map((r) => ({
        difficulty: r.difficulty,
        count: parseInt(r.count, 10),
      })),
      platformComparison: platformComparisonRaw.map((r) => ({ platform: r.platform, count: parseInt(r.count, 10) })),
      ratingProgression: ratingProgression.map((r) => ({
        date: r.contestDate,
        rating: r.rating,
        platform: r.platform,
        name: r.name,
      })),
    },
  });
});

const getHeatmap = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const year = parseInt(req.query.year, 10) || new Date().getUTCFullYear();

  const activities = await Activity.findAll({
    where: {
      userId,
      activityDate: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
    },
    attributes: ["activityDate", "problemsSolved"],
    raw: true,
  });

  res.json({
    data: activities.map((a) => ({ date: a.activityDate, count: a.problemsSolved })),
    year,
  });
});

module.exports = { getSummary, getCharts, getHeatmap };
