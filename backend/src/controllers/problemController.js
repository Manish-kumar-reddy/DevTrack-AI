const { Op } = require("sequelize");
const { sequelize, Problem, Favorite } = require("../models");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { syncActivityOnChange } = require("../utils/activitySync");

function serializeProblem(problem) {
  const json = problem.toJSON();
  const isFavorite = Boolean(json.favorite);
  delete json.favorite;
  return { ...json, isFavorite };
}

const listProblems = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    platform,
    difficulty,
    status,
    topic,
    favorite,
    sortBy = "createdAt",
    sortOrder = "DESC",
  } = req.query;

  const where = { userId: req.user.id };
  if (platform) where.platform = platform;
  if (difficulty) where.difficulty = difficulty;
  if (status) where.status = status;
  if (topic) where.topic = topic;
  if (search) {
    where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }, { topic: { [Op.like]: `%${search}%` } }];
  }

  const include = [{ model: Favorite, as: "favorite", required: Boolean(favorite), attributes: ["id"] }];

  const { rows, count } = await Problem.findAndCountAll({
    where,
    include,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  res.json({
    data: rows.map(serializeProblem),
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.max(1, Math.ceil(count / limit)),
    },
  });
});

const getProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [{ model: Favorite, as: "favorite", required: false, attributes: ["id"] }],
  });
  if (!problem) throw ApiError.notFound("Problem not found.");
  res.json({ data: serializeProblem(problem) });
});

const createProblem = asyncHandler(async (req, res) => {
  const { title, platform, difficulty, topic, status, notes, solvedDate, timeSpentMinutes } = req.body;

  const problem = await sequelize.transaction(async (t) => {
    const created = await Problem.create(
      {
        userId: req.user.id,
        title,
        platform,
        difficulty,
        topic,
        status: status || "Todo",
        notes: notes ?? null,
        solvedDate: solvedDate ?? null,
        timeSpentMinutes: timeSpentMinutes ?? null,
      },
      { transaction: t }
    );

    await syncActivityOnChange(req.user.id, null, created, t);
    return created;
  });

  res.status(201).json({ data: serializeProblem(problem) });
});

const updateProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!problem) throw ApiError.notFound("Problem not found.");

  const before = { status: problem.status, solvedDate: problem.solvedDate };

  const fields = ["title", "platform", "difficulty", "topic", "status", "notes", "solvedDate", "timeSpentMinutes"];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      problem[field] = req.body[field];
    }
  }

  const updated = await sequelize.transaction(async (t) => {
    await problem.save({ transaction: t });
    const after = { status: problem.status, solvedDate: problem.solvedDate };
    await syncActivityOnChange(req.user.id, before, after, t);
    return problem;
  });

  res.json({ data: serializeProblem(updated) });
});

const deleteProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!problem) throw ApiError.notFound("Problem not found.");

  await sequelize.transaction(async (t) => {
    await syncActivityOnChange(req.user.id, { status: problem.status, solvedDate: problem.solvedDate }, null, t);
    await problem.destroy({ transaction: t });
  });

  res.status(204).send();
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!problem) throw ApiError.notFound("Problem not found.");

  const existing = await Favorite.findOne({ where: { userId: req.user.id, problemId: problem.id } });

  if (existing) {
    await existing.destroy();
    return res.json({ data: { problemId: problem.id, isFavorite: false } });
  }

  await Favorite.create({ userId: req.user.id, problemId: problem.id });
  res.json({ data: { problemId: problem.id, isFavorite: true } });
});

module.exports = { listProblems, getProblem, createProblem, updateProblem, deleteProblem, toggleFavorite };
