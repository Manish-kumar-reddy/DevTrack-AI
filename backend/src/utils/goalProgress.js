const { Op } = require("sequelize");
const { Problem } = require("../models");
const { toDateOnly } = require("./streak");

/**
 * Computes a goal's progress at read time from the problems table (never
 * stored, so it can't drift). Shared by goalController (goal CRUD
 * responses) and analyticsController (the dashboard's "Today's Goal
 * Progress" widget) so this logic lives in exactly one place.
 */
async function withProgress(goal, userId) {
  const where = {
    userId,
    status: "Solved",
    solvedDate: { [Op.between]: [goal.startDate, goal.endDate] },
  };
  if (goal.targetTopic) where.topic = goal.targetTopic;

  const solvedCount = await Problem.count({ where });
  const completionPercent = Math.min(100, Math.round((solvedCount / goal.targetCount) * 100));
  const remaining = Math.max(0, goal.targetCount - solvedCount);
  const today = toDateOnly(new Date());
  const isExpired = today > goal.endDate && solvedCount < goal.targetCount;

  return {
    ...goal.toJSON(),
    progress: {
      solvedCount,
      remaining,
      completionPercent,
      isComplete: solvedCount >= goal.targetCount,
      isExpired,
    },
  };
}

module.exports = { withProgress };
