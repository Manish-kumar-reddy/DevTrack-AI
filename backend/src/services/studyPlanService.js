/**
 * Rule-based DSA study plan generator. No external/paid API is used -- every
 * recommendation comes from a static topic-progression graph and a small set
 * of well-known company interview profiles, both defined below.
 */

// Canonical DSA topic progression -- the order a topic is *learnable* in,
// roughly increasing in prerequisite depth. Used as the fallback ordering
// once weak-topic and company-priority topics have been placed up front.
const TOPIC_PROGRESSION = [
  "Arrays",
  "Strings",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Recursion",
  "Sorting",
  "Searching",
  "Linked List",
  "Stack",
  "Queue",
  "Binary Search",
  "Trees",
  "Binary Search Trees",
  "Heaps",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Backtracking",
  "Trie",
  "Bit Manipulation",
  "Math & Number Theory",
  "Advanced Graphs",
  "System Design Basics",
];

// Topics each company's interviews are known to lean on most heavily, used to
// re-prioritize TOPIC_PROGRESSION rather than replace it. Matched
// case-insensitively against a substring of the user's target company.
const COMPANY_PROFILES = [
  { match: "google", priority: ["Dynamic Programming", "Graphs", "Trees", "System Design Basics", "Backtracking"] },
  { match: "amazon", priority: ["Trees", "Graphs", "Arrays", "Linked List", "System Design Basics"] },
  { match: "microsoft", priority: ["Trees", "Linked List", "Strings", "Dynamic Programming", "Recursion"] },
  { match: "meta", priority: ["Graphs", "Trees", "Arrays", "Dynamic Programming", "System Design Basics"] },
  { match: "facebook", priority: ["Graphs", "Trees", "Arrays", "Dynamic Programming", "System Design Basics"] },
  { match: "apple", priority: ["Arrays", "Strings", "Trees", "Dynamic Programming", "Bit Manipulation"] },
  { match: "netflix", priority: ["System Design Basics", "Graphs", "Dynamic Programming", "Trees"] },
  { match: "adobe", priority: ["Strings", "Arrays", "Trees", "Dynamic Programming", "Recursion"] },
  { match: "flipkart", priority: ["Arrays", "Strings", "Dynamic Programming", "Graphs", "Trees"] },
  { match: "uber", priority: ["Graphs", "System Design Basics", "Dynamic Programming", "Arrays"] },
];

const DEFAULT_PRIORITY = ["Arrays", "Strings", "Trees", "Dynamic Programming", "Graphs"];

function normalizeTopic(topic) {
  const found = TOPIC_PROGRESSION.find((t) => t.toLowerCase() === topic.trim().toLowerCase());
  return found || topic.trim();
}

function resolveCompanyPriority(targetCompany) {
  if (!targetCompany) return DEFAULT_PRIORITY;
  const normalized = targetCompany.trim().toLowerCase();
  const profile = COMPANY_PROFILES.find((p) => normalized.includes(p.match));
  return profile ? profile.priority : DEFAULT_PRIORITY;
}

/** Weak topic first, then the company's priority list, then the rest of the progression -- each deduped in place. */
function buildRecommendedTopics(weakTopic, targetCompany) {
  const normalizedWeak = normalizeTopic(weakTopic);
  const companyPriority = resolveCompanyPriority(targetCompany);

  const ordered = [normalizedWeak, ...companyPriority, ...TOPIC_PROGRESSION];
  const seen = new Set();
  const deduped = [];
  for (const topic of ordered) {
    const key = topic.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(topic);
    }
  }
  return deduped;
}

/** Difficulty mix shifts from Easy-heavy to Hard-heavy as the plan progresses through its three phases. */
function difficultyProgression() {
  return {
    foundation: { easy: 60, medium: 35, hard: 5 },
    core: { easy: 25, medium: 55, hard: 20 },
    finalPush: { easy: 10, medium: 45, hard: 45 },
  };
}

function phaseSplitForDays(daysRemaining) {
  if (daysRemaining <= 7) {
    return [
      { name: "Weak-Topic Sprint", days: Math.max(1, Math.round(daysRemaining * 0.4)), difficultyKey: "foundation" },
      { name: "Company-Priority Drill", days: Math.max(1, Math.round(daysRemaining * 0.4)), difficultyKey: "core" },
      { name: "Mock Interviews & Revision", days: 0, difficultyKey: "finalPush" },
    ];
  }
  if (daysRemaining <= 30) {
    return [
      { name: "Foundation", days: Math.round(daysRemaining * 0.3), difficultyKey: "foundation" },
      { name: "Core Company-Priority Topics", days: Math.round(daysRemaining * 0.5), difficultyKey: "core" },
      { name: "Mock Interviews & Revision", days: 0, difficultyKey: "finalPush" },
    ];
  }
  return [
    { name: "Foundation", days: Math.round(daysRemaining * 0.3), difficultyKey: "foundation" },
    { name: "Core Company-Priority Topics", days: Math.round(daysRemaining * 0.4), difficultyKey: "core" },
    { name: "Advanced Topics & Mock Interviews", days: Math.round(daysRemaining * 0.2), difficultyKey: "finalPush" },
    { name: "Final Revision", days: 0, difficultyKey: "finalPush" },
  ];
}

/** Fills in each phase's `days` so they sum to exactly daysRemaining, giving any remainder to the last phase. */
function finalizePhaseDays(phases, daysRemaining) {
  const assigned = phases.slice(0, -1).reduce((sum, p) => sum + p.days, 0);
  const finalized = [...phases];
  finalized[finalized.length - 1] = {
    ...finalized[finalized.length - 1],
    days: Math.max(1, daysRemaining - assigned),
  };
  return finalized.filter((p) => p.days > 0);
}

function problemsPerDayFor(daysRemaining) {
  if (daysRemaining <= 7) return 4;
  if (daysRemaining <= 30) return 3;
  return 2;
}

function buildRoadmap(recommendedTopics, daysRemaining) {
  const rawPhases = phaseSplitForDays(daysRemaining);
  const phases = finalizePhaseDays(rawPhases, daysRemaining);
  const difficulty = difficultyProgression();

  let topicCursor = 0;
  const topicsPerPhase = Math.max(1, Math.ceil(recommendedTopics.length / phases.length));

  return phases.map((phase) => {
    const topics = recommendedTopics.slice(topicCursor, topicCursor + topicsPerPhase);
    topicCursor += topicsPerPhase;
    return {
      phase: phase.name,
      days: phase.days,
      topics: topics.length > 0 ? topics : [recommendedTopics[recommendedTopics.length - 1]],
      difficultyMix: difficulty[phase.difficultyKey],
    };
  });
}

function buildDailySchedule(roadmap, problemsPerDay) {
  const schedule = [];
  let dayCounter = 1;

  for (const phase of roadmap) {
    for (let i = 0; i < phase.days; i += 1) {
      const topic = phase.topics[i % phase.topics.length];
      schedule.push({
        day: dayCounter,
        phase: phase.phase,
        topic,
        problemsTarget: problemsPerDay,
        difficultyMix: phase.difficultyMix,
        activity:
          i === 0
            ? `Learn/review ${topic} concepts, then solve ${problemsPerDay} problems (start Easy, build up).`
            : `Solve ${problemsPerDay} ${topic} problems, mixing difficulty per today's target.`,
      });
      dayCounter += 1;
    }
  }
  return schedule;
}

function generateStudyPlan({ weakTopic, targetCompany, daysRemaining }) {
  const recommendedTopics = buildRecommendedTopics(weakTopic, targetCompany);
  const roadmap = buildRoadmap(recommendedTopics, daysRemaining);
  const problemsPerDay = problemsPerDayFor(daysRemaining);
  const dailySchedule = buildDailySchedule(roadmap, problemsPerDay);

  return {
    weakTopic: normalizeTopic(weakTopic),
    targetCompany: targetCompany || null,
    daysRemaining,
    recommendedTopics: recommendedTopics.slice(0, 10),
    roadmap,
    dailySchedule,
    totalProblemsTarget: dailySchedule.reduce((sum, d) => sum + d.problemsTarget, 0),
    summary:
      `Focused ${daysRemaining}-day plan starting with ${normalizeTopic(weakTopic)}` +
      (targetCompany ? `, weighted toward ${targetCompany}'s most common interview topics.` : "."),
  };
}

module.exports = { generateStudyPlan, TOPIC_PROGRESSION };
