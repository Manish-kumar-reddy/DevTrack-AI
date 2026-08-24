const ApiError = require("../utils/ApiError");

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

/**
 * Turns a LeetCode topic tag ("Dynamic Programming", "Array", ...) into this
 * app's single `topic` string -- LeetCode returns several tags per problem,
 * we only store one, so we take the first (LeetCode orders the most
 * central/primary tag first in practice).
 */
function primaryTopic(topicTags) {
  if (!topicTags || topicTags.length === 0) return "General";
  return topicTags[0].name;
}

/** Best-effort "de-slugification" for a GFG-style slug -- see fetchGeeksforGeeks() for why this is a fallback, not a real fetch. */
function titleFromSlug(slug) {
  const withoutTrailingId = slug.replace(/-?\d+$/, "");
  return withoutTrailingId
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function detectPlatform(url) {
  let host;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  if (host === "leetcode.com") return "LeetCode";
  if (host === "geeksforgeeks.org") return "GeeksforGeeks";
  return null;
}

function extractLeetCodeSlug(url) {
  const match = new URL(url).pathname.match(/\/problems\/([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

function extractGfgSlug(url) {
  // e.g. /problems/maximum-subarray2408/1 -> "maximum-subarray2408"
  const match = new URL(url).pathname.match(/\/problems\/([a-z0-9-]+)/i);
  return match ? match[1] : null;
}

async function fetchLeetCode(slug) {
  const query = `
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        difficulty
        topicTags { name }
      }
    }
  `;

  let response;
  try {
    response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // LeetCode's GraphQL endpoint rejects requests without a plausible
        // Referer -- this is the same public query the problem page itself
        // issues client-side, just called server-to-server.
        Referer: `https://leetcode.com/problems/${slug}/`,
      },
      body: JSON.stringify({ query, variables: { titleSlug: slug } }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (err) {
    throw ApiError.badRequest("Could not reach LeetCode. Please try again or enter the details manually.");
  }

  if (!response.ok) {
    throw ApiError.badRequest("Could not reach LeetCode. Please try again or enter the details manually.");
  }

  const payload = await response.json();
  const question = payload?.data?.question;
  if (!question) {
    throw ApiError.badRequest("Invalid problem URL");
  }

  return {
    title: question.title,
    difficulty: question.difficulty,
    topic: primaryTopic(question.topicTags),
    platform: "LeetCode",
    sourceSlug: slug,
    partial: false,
  };
}

/**
 * GeeksforGeeks problem pages render no problem-specific data server-side
 * (title, difficulty, and tags are all fetched client-side by React after
 * the page loads, against an undocumented internal API with no stable
 * public endpoint) -- there is no reliable way to fetch real metadata with
 * a plain server-side HTTP request. Rather than silently return wrong data,
 * this validates the URL and derives a best-effort title from the slug,
 * and flags the result `partial: true` so the frontend can tell the user
 * difficulty/topic still need to be filled in by hand.
 */
async function fetchGeeksforGeeks(slug) {
  return {
    title: titleFromSlug(slug),
    difficulty: null,
    topic: null,
    platform: "GeeksforGeeks",
    sourceSlug: slug,
    partial: true,
    partialReason:
      "GeeksforGeeks doesn't expose a public API for problem metadata, so only the title could be inferred from the URL. Please fill in difficulty and topic.",
  };
}

/** Detects the platform, extracts the slug, and fetches (or best-effort infers) problem details for one URL. */
async function fetchProblemDetails(url) {
  if (typeof url !== "string" || url.trim() === "") {
    throw ApiError.badRequest("Invalid problem URL");
  }

  const platform = detectPlatform(url);
  if (!platform) {
    throw ApiError.badRequest("Invalid problem URL");
  }

  if (platform === "LeetCode") {
    const slug = extractLeetCodeSlug(url);
    if (!slug) throw ApiError.badRequest("Invalid problem URL");
    return fetchLeetCode(slug);
  }

  const slug = extractGfgSlug(url);
  if (!slug) throw ApiError.badRequest("Invalid problem URL");
  return fetchGeeksforGeeks(slug);
}

module.exports = { fetchProblemDetails, detectPlatform };
