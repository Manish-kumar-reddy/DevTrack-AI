const { Op, fn, col, literal } = require("sequelize");
const { sequelize, Problem, Contest, Activity, Goal, Revision } = require("../models");
const asyncHandler = require("../utils/asyncHandler");
const { computeCurrentStreak, computeActiveDaysInWindow, toDateOnly, addDays } = require("../utils/streak");
const { withProgress } = require("../utils/goalProgress");

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
          // DATE_FORMAT is MySQL-only -- TO_CHAR is the Postgres equivalent now that
          // this app runs on Neon. Same "YYYY-MM" grouping, just Postgres syntax.
          [fn("TO_CHAR", col("solved_date"), "YYYY-MM"), "month"],
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

/**
 * Bundles the extra dashboard widgets (weakest/strongest topic, upcoming
 * revisions, recently solved, today's goal progress) into one call, the
 * same pattern as getSummary -- avoids the dashboard firing five separate
 * requests on load.
 */
const getWidgets = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const MIN_TOPIC_ATTEMPTS = 3;

  const [topicRows, upcomingRevisions, recentlySolved, todaysGoals] = await Promise.all([
    Problem.findAll({
      where: { userId, status: { [Op.in]: ["Attempted", "Solved"] } },
      attributes: ["topic", "status", [fn("COUNT", col("id")), "count"]],
      group: ["topic", "status"],
      raw: true,
    }),
    Revision.findAll({
      where: {
        userId,
        completed: false,
        revisionDate: { [Op.between]: [toDateOnly(new Date()), toDateOnly(addDays(new Date(), 7))] },
      },
      include: [{ model: Problem, as: "problem", attributes: ["id", "title", "platform", "topic"] }],
      order: [["revisionDate", "ASC"]],
      limit: 10,
    }),
    Problem.findAll({
      where: { userId, status: "Solved" },
      attributes: ["id", "title", "platform", "difficulty", "topic", "solvedDate"],
      order: [["solvedDate", "DESC"]],
      limit: 5,
    }),
    Goal.findAll({ where: { userId, period: "daily" } }),
  ]);

  const byTopic = {};
  for (const row of topicRows) {
    byTopic[row.topic] = byTopic[row.topic] || { solved: 0, total: 0 };
    byTopic[row.topic].total += parseInt(row.count, 10);
    if (row.status === "Solved") byTopic[row.topic].solved += parseInt(row.count, 10);
  }

  let strongestTopic = null;
  let weakestTopic = null;
  let bestSolved = -1;
  let worstRate = Infinity;
  for (const [topic, { solved, total }] of Object.entries(byTopic)) {
    if (solved > bestSolved) {
      bestSolved = solved;
      strongestTopic = { topic, solved };
    }
    if (total >= MIN_TOPIC_ATTEMPTS) {
      const rate = solved / total;
      if (rate < worstRate) {
        worstRate = rate;
        weakestTopic = { topic, solved, total, solveRate: Math.round(rate * 100) };
      }
    }
  }
  if (strongestTopic && strongestTopic.solved === 0) strongestTopic = null;

  const today = toDateOnly(new Date());
  const activeDailyGoals = todaysGoals.filter((g) => g.startDate <= today && g.endDate >= today);
  const todaysGoalProgress = await Promise.all(activeDailyGoals.map((g) => withProgress(g, userId)));

  res.json({
    data: {
      strongestTopic,
      weakestTopic,
      upcomingRevisions: upcomingRevisions.map((r) => r.toJSON()),
      recentlySolved: recentlySolved.map((p) => p.toJSON()),
      todaysGoalProgress,
    },
  });
});

module.exports = { getSummary, getCharts, getHeatmap, getWidgets };
