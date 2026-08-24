const { Activity } = require("../models");

async function adjustActivity(userId, date, delta, transaction) {
  if (!date) return;

  const [activity] = await Activity.findOrCreate({
    where: { userId, activityDate: date },
    defaults: { userId, activityDate: date, problemsSolved: 0 },
    transaction,
  });

  const next = activity.problemsSolved + delta;
  if (next <= 0) {
    await activity.destroy({ transaction });
  } else {
    activity.problemsSolved = next;
    await activity.save({ transaction });
  }
}

/**
 * Keeps the per-day activity rollup (used for streaks and the heatmap) in sync
 * whenever a problem's solved state changes. `before`/`after` are plain
 * { status, solvedDate } shapes; pass null for `before` on create and null for
 * `after` on delete.
 */
async function syncActivityOnChange(userId, before, after, transaction) {
  const beforeDate = before && before.status === "Solved" && before.solvedDate ? before.solvedDate : null;
  const afterDate = after && after.status === "Solved" && after.solvedDate ? after.solvedDate : null;

  if (beforeDate === afterDate) return;

  if (beforeDate) {
    await adjustActivity(userId, beforeDate, -1, transaction);
  }
  if (afterDate) {
    await adjustActivity(userId, afterDate, 1, transaction);
  }
}

module.exports = { syncActivityOnChange };
