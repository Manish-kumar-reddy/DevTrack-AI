const { Op } = require("sequelize");
const { Activity } = require("../models");

function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

/**
 * Current streak = consecutive active days (problemsSolved > 0) counting
 * backward from today. If today has no activity yet, the streak counts
 * backward from yesterday instead, so a user who hasn't solved anything
 * *today* doesn't see yesterday's streak reset to zero prematurely.
 */
async function computeCurrentStreak(userId) {
  const activities = await Activity.findAll({
    where: { userId, problemsSolved: { [Op.gt]: 0 } },
    attributes: ["activityDate"],
    order: [["activityDate", "DESC"]],
  });

  const activeDates = new Set(activities.map((a) => a.activityDate));
  if (activeDates.size === 0) return 0;

  let cursor = new Date(`${toDateOnly(new Date())}T00:00:00.000Z`);
  if (!activeDates.has(toDateOnly(cursor))) {
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (activeDates.has(toDateOnly(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** Active days within the trailing N days (inclusive of today), for the "weekly consistency" stat. */
async function computeActiveDaysInWindow(userId, windowDays) {
  const start = addDays(new Date(`${toDateOnly(new Date())}T00:00:00.000Z`), -(windowDays - 1));
  const count = await Activity.count({
    where: {
      userId,
      activityDate: { [Op.gte]: toDateOnly(start) },
      problemsSolved: { [Op.gt]: 0 },
    },
  });
  return count;
}

module.exports = { computeCurrentStreak, computeActiveDaysInWindow, toDateOnly, addDays };
