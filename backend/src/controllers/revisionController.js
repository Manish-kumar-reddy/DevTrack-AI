const { Op } = require("sequelize");
const { Revision, Problem } = require("../models");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { toDateOnly, addDays } = require("../utils/streak");

const PROBLEM_ATTRS = ["id", "title", "platform", "difficulty", "topic"];

const getTodaysRevisions = asyncHandler(async (req, res) => {
  const today = toDateOnly(new Date());
  const revisions = await Revision.findAll({
    where: { userId: req.user.id, revisionDate: today, completed: false },
    include: [{ model: Problem, as: "problem", attributes: PROBLEM_ATTRS }],
    order: [["intervalDays", "ASC"]],
  });
  res.json({ data: revisions });
});

/** Upcoming, excluding today -- for the dashboard's "Upcoming Revisions" widget. */
const getUpcomingRevisions = asyncHandler(async (req, res) => {
  const windowDays = Math.min(30, parseInt(req.query.days, 10) || 7);
  const today = new Date(`${toDateOnly(new Date())}T00:00:00.000Z`);
  const start = toDateOnly(addDays(today, 1));
  const end = toDateOnly(addDays(today, windowDays));

  const revisions = await Revision.findAll({
    where: { userId: req.user.id, revisionDate: { [Op.between]: [start, end] }, completed: false },
    include: [{ model: Problem, as: "problem", attributes: PROBLEM_ATTRS }],
    order: [["revisionDate", "ASC"]],
  });
  res.json({ data: revisions });
});

const completeRevision = asyncHandler(async (req, res) => {
  const revision = await Revision.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!revision) throw ApiError.notFound("Revision not found.");

  revision.completed = true;
  await revision.save();
  res.json({ data: revision });
});

module.exports = { getTodaysRevisions, getUpcomingRevisions, completeRevision };
