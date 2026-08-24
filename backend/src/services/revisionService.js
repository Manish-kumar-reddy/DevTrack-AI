const { Revision } = require("../models");

const INTERVALS_DAYS = [3, 7, 30];

function addDays(dateString, days) {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Creates the +3/+7/+30 day revision reminders for a newly-solved problem.
 * Idempotent per (problemId, intervalDays) -- findOrCreate so re-solving an
 * already-solved problem (e.g. editing solvedDate) never creates duplicates.
 */
async function scheduleRevisions(userId, problemId, solvedDate, transaction) {
  for (const days of INTERVALS_DAYS) {
    await Revision.findOrCreate({
      where: { problemId, intervalDays: days },
      defaults: {
        userId,
        problemId,
        intervalDays: days,
        revisionDate: addDays(solvedDate, days),
        completed: false,
      },
      transaction,
    });
  }
}

module.exports = { scheduleRevisions, INTERVALS_DAYS };
