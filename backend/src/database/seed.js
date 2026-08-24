/**
 * Idempotent demo-data seeder. Safe to run against a fresh database (creates
 * a demo account + sample data) or an existing one (does nothing if the demo
 * account already exists). Run with `npm run seed` from backend/.
 */
require("dotenv").config();
const { sequelize, User, Problem, Contest, Goal, Activity } = require("../models");

const DEMO_EMAIL = "demo@devtrack.ai";
const DEMO_PASSWORD = "Demo@12345";

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

const SAMPLE_PROBLEMS = [
  { title: "Two Sum", platform: "LeetCode", difficulty: "Easy", topic: "Arrays", daysAgo: 20, timeSpentMinutes: 12 },
  { title: "Valid Parentheses", platform: "LeetCode", difficulty: "Easy", topic: "Stack", daysAgo: 19, timeSpentMinutes: 15 },
  { title: "Merge Two Sorted Lists", platform: "LeetCode", difficulty: "Easy", topic: "Linked List", daysAgo: 18, timeSpentMinutes: 18 },
  { title: "Merge Intervals", platform: "LeetCode", difficulty: "Medium", topic: "Arrays", daysAgo: 17, timeSpentMinutes: 30 },
  { title: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium", topic: "Sliding Window", daysAgo: 16, timeSpentMinutes: 28 },
  { title: "Course Schedule", platform: "GeeksforGeeks", difficulty: "Hard", topic: "Graphs", daysAgo: 15, timeSpentMinutes: 45 },
  { title: "Climbing Stairs", platform: "LeetCode", difficulty: "Easy", topic: "Dynamic Programming", daysAgo: 14, timeSpentMinutes: 10 },
  { title: "House Robber", platform: "LeetCode", difficulty: "Medium", topic: "Dynamic Programming", daysAgo: 13, timeSpentMinutes: 25 },
  { title: "Number of Islands", platform: "LeetCode", difficulty: "Medium", topic: "Graphs", daysAgo: 12, timeSpentMinutes: 32 },
  { title: "Binary Tree Level Order Traversal", platform: "HackerRank", difficulty: "Medium", topic: "Trees", daysAgo: 11, timeSpentMinutes: 26 },
  { title: "Validate Binary Search Tree", platform: "LeetCode", difficulty: "Medium", topic: "Trees", daysAgo: 10, timeSpentMinutes: 24 },
  { title: "Word Break", platform: "LeetCode", difficulty: "Medium", topic: "Dynamic Programming", daysAgo: 9, timeSpentMinutes: 35 },
  { title: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard", topic: "Two Pointers", daysAgo: 8, timeSpentMinutes: 40 },
  { title: "Kth Largest Element in an Array", platform: "LeetCode", difficulty: "Medium", topic: "Heaps", daysAgo: 6, timeSpentMinutes: 20 },
  { title: "Clone Graph", platform: "LeetCode", difficulty: "Medium", topic: "Graphs", daysAgo: 5, timeSpentMinutes: 30 },
  { title: "3Sum", platform: "LeetCode", difficulty: "Medium", topic: "Two Pointers", daysAgo: 3, timeSpentMinutes: 22 },
  { title: "N-Queens", platform: "LeetCode", difficulty: "Hard", topic: "Backtracking", daysAgo: 2, timeSpentMinutes: 50 },
  { title: "Container With Most Water", platform: "LeetCode", difficulty: "Medium", topic: "Two Pointers", daysAgo: 1, timeSpentMinutes: 18 },
  { title: "Best Time to Buy and Sell Stock", platform: "LeetCode", difficulty: "Easy", topic: "Arrays", daysAgo: 0, timeSpentMinutes: 14 },
];

const SAMPLE_UNSOLVED = [
  { title: "Regular Expression Matching", platform: "LeetCode", difficulty: "Hard", topic: "Dynamic Programming", status: "Attempted" },
  { title: "Serialize and Deserialize Binary Tree", platform: "LeetCode", difficulty: "Hard", topic: "Trees", status: "Todo" },
];

const SAMPLE_CONTESTS = [
  { name: "Weekly Contest 398", platform: "LeetCode", daysAgo: 25, rating: 1420, rank: 3200, problemsSolved: 2 },
  { name: "Weekly Contest 399", platform: "LeetCode", daysAgo: 18, rating: 1465, rank: 2600, problemsSolved: 2 },
  { name: "Codeforces Round 950 (Div 2)", platform: "CodeForces", daysAgo: 12, rating: 1310, rank: 1100, problemsSolved: 3 },
  { name: "Weekly Contest 401", platform: "LeetCode", daysAgo: 4, rating: 1520, rank: 1800, problemsSolved: 3 },
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const existing = await User.findOne({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log(`Demo user ${DEMO_EMAIL} already exists -- nothing to seed.`);
    await sequelize.close();
    return;
  }

  const user = await User.create({
    name: "Demo Developer",
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    targetCompany: "Google",
    bio: "Preparing for SDE interviews, one problem at a time.",
  });

  for (const p of SAMPLE_PROBLEMS) {
    const solvedDate = daysAgo(p.daysAgo);
    await Problem.create({
      userId: user.id,
      title: p.title,
      platform: p.platform,
      difficulty: p.difficulty,
      topic: p.topic,
      status: "Solved",
      solvedDate,
      timeSpentMinutes: p.timeSpentMinutes,
    });

    const [activity] = await Activity.findOrCreate({
      where: { userId: user.id, activityDate: solvedDate },
      defaults: { userId: user.id, activityDate: solvedDate, problemsSolved: 0 },
    });
    activity.problemsSolved += 1;
    await activity.save();
  }

  for (const p of SAMPLE_UNSOLVED) {
    await Problem.create({ userId: user.id, ...p });
  }

  for (const c of SAMPLE_CONTESTS) {
    await Contest.create({
      userId: user.id,
      name: c.name,
      platform: c.platform,
      contestDate: daysAgo(c.daysAgo),
      rating: c.rating,
      rank: c.rank,
      problemsSolved: c.problemsSolved,
    });
  }

  await Goal.create({
    userId: user.id,
    period: "weekly",
    title: "Solve 7 problems this week",
    targetCount: 7,
    startDate: daysAgo(6),
    endDate: daysAgo(0),
  });

  await Goal.create({
    userId: user.id,
    period: "monthly",
    title: "20 Dynamic Programming problems",
    targetTopic: "Dynamic Programming",
    targetCount: 20,
    startDate: daysAgo(29),
    endDate: daysAgo(0),
  });

  console.log("Seed complete.");
  console.log(`Demo login -> email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`);
  await sequelize.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
