const { Goal } = require("../models");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { computeCurrentStreak } = require("../utils/streak");
const { withProgress } = require("../utils/goalProgress");

const listGoals = asyncHandler(async (req, res) => {
  const { period } = req.query;
  const where = { userId: req.user.id };
  if (period) where.period = period;

  const goals = await Goal.findAll({ where, order: [["startDate", "DESC"]] });
  const withProgressData = await Promise.all(goals.map((g) => withProgress(g, req.user.id)));
  const streak = await computeCurrentStreak(req.user.id);

  res.json({ data: withProgressData, currentStreak: streak });
});

const getGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!goal) throw ApiError.notFound("Goal not found.");
  res.json({ data: await withProgress(goal, req.user.id) });
});

const createGoal = asyncHandler(async (req, res) => {
  const { period, title, targetTopic, targetCount, startDate, endDate } = req.body;
  const goal = await Goal.create({
    userId: req.user.id,
    period,
    title,
    targetTopic: targetTopic ?? null,
    targetCount,
    startDate,
    endDate,
  });
  res.status(201).json({ data: await withProgress(goal, req.user.id) });
});

const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!goal) throw ApiError.notFound("Goal not found.");

  const fields = ["period", "title", "targetTopic", "targetCount", "startDate", "endDate"];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      goal[field] = req.body[field];
    }
  }
  await goal.save();
  res.json({ data: await withProgress(goal, req.user.id) });
});

const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!goal) throw ApiError.notFound("Goal not found.");
  await goal.destroy();
  res.status(204).send();
});

module.exports = { listGoals, getGoal, createGoal, updateGoal, deleteGoal };
