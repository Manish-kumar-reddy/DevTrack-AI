const { Problem, Achievement } = require("../models");
const { computeCurrentStreak } = require("../utils/streak");

/**
 * Static catalog of every badge that can be earned. `check(stats)` decides
 * whether a user with the given `stats` (see computeStats below) qualifies.
 * Only the *unlocked* subset per user is persisted (the `achievements`
 * table) -- this catalog itself is app config, not data.
 */
const ACHIEVEMENTS = [
  {
    key: "first_problem",
    title: "First Problem",
    description: "Solve your first problem.",
    icon: "🎉",
    check: (s) => s.totalSolved >= 1,
  },
  {
    key: "solved_50",
    title: "50 Solved",
    description: "Solve 50 problems.",
    icon: "🥉",
    check: (s) => s.totalSolved >= 50,
  },
  {
    key: "solved_100",
    title: "100 Solved",
    description: "Solve 100 problems.",
    icon: "🥈",
    check: (s) => s.totalSolved >= 100,
  },
  {
    key: "solved_250",
    title: "250 Solved",
    description: "Solve 250 problems.",
    icon: "🥇",
    check: (s) => s.totalSolved >= 250,
  },
  {
    key: "arrays_master",
    title: "Arrays Master",
    description: "Solve 50 Arrays problems.",
    icon: "🧩",
    check: (s) => (s.byTopic["Arrays"] || 0) >= 50,
  },
  {
    key: "dp_master",
    title: "DP Master",
    description: "Solve 50 Dynamic Programming problems.",
    icon: "🧠",
    check: (s) => (s.byTopic["Dynamic Programming"] || 0) >= 50,
  },
  {
    key: "graph_master",
    title: "Graph Master",
    description: "Solve 50 Graphs problems.",
    icon: "🕸️",
    check: (s) => (s.byTopic["Graphs"] || 0) >= 50,
  },
  {
    key: "streak_30",
    title: "30 Day Streak",
    description: "Solve at least one problem a day for 30 days straight.",
    icon: "🔥",
    check: (s) => s.currentStreak >= 30,
  },
];

async function computeStats(userId) {
  const [totalSolved, byTopicRows, currentStreak] = await Promise.all([
    Problem.count({ where: { userId, status: "Solved" } }),
    Problem.findAll({
      where: { userId, status: "Solved" },
      attributes: ["topic"],
      raw: true,
    }).then((rows) => {
      const counts = {};
      for (const r of rows) counts[r.topic] = (counts[r.topic] || 0) + 1;
      return counts;
    }),
    computeCurrentStreak(userId),
  ]);

  return { totalSolved, byTopic: byTopicRows, currentStreak };
}

/**
 * Re-evaluates every achievement for a user and inserts rows for any newly
 * satisfied ones (already-unlocked achievements are left untouched -- this
 * never revokes a badge, e.g. if a streak later breaks). Returns the badges
 * newly unlocked by *this* call, so callers can surface a "badge unlocked!"
 * toast if they want to.
 */
async function checkAndUnlockAchievements(userId) {
  const stats = await computeStats(userId);
  const alreadyUnlocked = new Set(
    (await Achievement.findAll({ where: { userId }, attributes: ["key"], raw: true })).map((a) => a.key)
  );

  const newlyUnlocked = [];
  for (const achievement of ACHIEVEMENTS) {
    if (alreadyUnlocked.has(achievement.key)) continue;
    if (achievement.check(stats)) {
      await Achievement.create({ userId, key: achievement.key });
      newlyUnlocked.push(achievement.key);
    }
  }
  return newlyUnlocked;
}

async function listAchievementsForUser(userId) {
  const unlocked = await Achievement.findAll({ where: { userId }, raw: true });
  const unlockedByKey = Object.fromEntries(unlocked.map((a) => [a.key, a.unlockedAt]));

  return ACHIEVEMENTS.map((a) => ({
    key: a.key,
    title: a.title,
    description: a.description,
    icon: a.icon,
    unlocked: Boolean(unlockedByKey[a.key]),
    unlockedAt: unlockedByKey[a.key] || null,
  }));
}

module.exports = { ACHIEVEMENTS, checkAndUnlockAchievements, listAchievementsForUser };
