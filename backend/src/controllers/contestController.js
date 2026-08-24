const { Contest } = require("../models");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const listContests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, platform, sortBy = "contestDate", sortOrder = "DESC" } = req.query;

  const where = { userId: req.user.id };
  if (platform) where.platform = platform;

  const { rows, count } = await Contest.findAndCountAll({
    where,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit,
    offset: (page - 1) * limit,
  });

  res.json({
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.max(1, Math.ceil(count / limit)) },
  });
});

const getContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!contest) throw ApiError.notFound("Contest not found.");
  res.json({ data: contest });
});

const createContest = asyncHandler(async (req, res) => {
  const { name, platform, contestDate, rating, rank, problemsSolved } = req.body;
  const contest = await Contest.create({
    userId: req.user.id,
    name,
    platform,
    contestDate,
    rating: rating ?? null,
    rank: rank ?? null,
    problemsSolved: problemsSolved ?? 0,
  });
  res.status(201).json({ data: contest });
});

const updateContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!contest) throw ApiError.notFound("Contest not found.");

  const fields = ["name", "platform", "contestDate", "rating", "rank", "problemsSolved"];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      contest[field] = req.body[field];
    }
  }
  await contest.save();
  res.json({ data: contest });
});

const deleteContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!contest) throw ApiError.notFound("Contest not found.");
  await contest.destroy();
  res.status(204).send();
});

const ratingHistory = asyncHandler(async (req, res) => {
  const contests = await Contest.findAll({
    where: { userId: req.user.id },
    order: [["contestDate", "ASC"]],
    attributes: ["id", "name", "platform", "contestDate", "rating", "rank"],
  });
  res.json({ data: contests });
});

module.exports = { listContests, getContest, createContest, updateContest, deleteContest, ratingHistory };
