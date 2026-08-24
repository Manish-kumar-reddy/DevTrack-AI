const { Op } = require("sequelize");
const { sequelize, Problem, Favorite, ProblemNote } = require("../models");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { syncActivityOnChange } = require("../utils/activitySync");
const { scheduleRevisions } = require("../services/revisionService");
const { checkAndUnlockAchievements } = require("../services/achievementService");
const { fetchProblemDetails } = require("../services/problemFetchService");

function serializeProblem(problem) {
  const json = problem.toJSON();
  const isFavorite = Boolean(json.favorite);
  delete json.favorite;
  return { ...json, isFavorite };
}

/**
 * Revision scheduling and achievement checks are supplementary side effects
 * of a problem being solved, not part of the core write -- a failure here
 * must never fail the user's create/update request (same pattern as the
 * chat_history persistence in the sibling support-ai-triage project).
 */
async function onProblemSolved(userId, problemId, solvedDate) {
  try {
    await scheduleRevisions(userId, problemId, solvedDate);
    await checkAndUnlockAchievements(userId);
  } catch (err) {
    console.error(`Failed to schedule revisions / check achievements for user ${userId}:`, err);
  }
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
  const {
    title,
    platform,
    difficulty,
    topic,
    status,
    notes,
    solvedDate,
    timeSpentMinutes,
    sourceUrl,
    sourceSlug,
  } = req.body;

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
        sourceUrl: sourceUrl ?? null,
        sourceSlug: sourceSlug ?? null,
      },
      { transaction: t }
    );

    await syncActivityOnChange(req.user.id, null, created, t);
    return created;
  });

  if (problem.status === "Solved" && problem.solvedDate) {
    await onProblemSolved(req.user.id, problem.id, problem.solvedDate);
  }

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

  const justSolved = before.status !== "Solved" && updated.status === "Solved";
  if (justSolved && updated.solvedDate) {
    await onProblemSolved(req.user.id, updated.id, updated.solvedDate);
  }

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

/** POST /problems/fetch -- single "Quick Add from URL" lookup, used by ProblemFormModal. */
const fetchProblem = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const details = await fetchProblemDetails(url);
  res.json(details);
});

/**
 * POST /problems/bulk-import -- fetches every URL, skips any that are
 * already imported (same user + platform + slug) or fail to resolve, and
 * creates the rest as Todo problems in one pass.
 */
const bulkImportProblems = asyncHandler(async (req, res) => {
  const { urls } = req.body;

  let imported = 0;
  const skipped = [];

  for (const rawUrl of urls) {
    const url = rawUrl.trim();
    if (!url) continue;

    let details;
    try {
      details = await fetchProblemDetails(url);
    } catch (err) {
      skipped.push({ url, reason: err instanceof ApiError ? err.message : "Failed to fetch." });
      continue;
    }

    const existing = await Problem.findOne({
      where: { userId: req.user.id, platform: details.platform, sourceSlug: details.sourceSlug },
    });
    if (existing) {
      skipped.push({ url, reason: "Already imported." });
      continue;
    }

    await Problem.create({
      userId: req.user.id,
      title: details.title,
      platform: details.platform,
      difficulty: details.difficulty || "Medium",
      topic: details.topic || "General",
      status: "Todo",
      sourceUrl: url,
      sourceSlug: details.sourceSlug,
    });
    imported += 1;
  }

  res.json({
    data: {
      imported,
      skipped: skipped.length,
      skippedDetails: skipped,
    },
  });
});

const getProblemNote = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!problem) throw ApiError.notFound("Problem not found.");

  const note = await ProblemNote.findOne({ where: { problemId: problem.id } });
  res.json({ data: note || { problemId: problem.id, notes: null, mistakes: null, timeComplexity: null, spaceComplexity: null } });
});

const upsertProblemNote = asyncHandler(async (req, res) => {
  const problem = await Problem.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!problem) throw ApiError.notFound("Problem not found.");

  const { notes, mistakes, timeComplexity, spaceComplexity } = req.body;

  const [note] = await ProblemNote.findOrCreate({
    where: { problemId: problem.id },
    defaults: { problemId: problem.id },
  });

  if (notes !== undefined) note.notes = notes;
  if (mistakes !== undefined) note.mistakes = mistakes;
  if (timeComplexity !== undefined) note.timeComplexity = timeComplexity;
  if (spaceComplexity !== undefined) note.spaceComplexity = spaceComplexity;
  await note.save();

  res.json({ data: note });
});

module.exports = {
  listProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  toggleFavorite,
  fetchProblem,
  bulkImportProblems,
  getProblemNote,
  upsertProblemNote,
};
