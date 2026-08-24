# API Documentation

Base URL: `{VITE_API_URL}` (e.g. `http://localhost:5000/api` locally, or your deployed Render URL + `/api`).

All request/response bodies are JSON. All endpoints except `/auth/register` and `/auth/login` require:

```
Authorization: Bearer <jwt>
```

A missing or invalid token returns `401`. Every resource endpoint is scoped to the authenticated user -- attempting to read, update, or delete another user's data returns `404` (existence is never leaked across accounts).

Validation errors return `400` with:

```json
{ "message": "Validation failed.", "details": [{ "field": "email", "message": "A valid email is required." }] }
```

---

## Auth

### `POST /auth/register`

```json
// Request
{ "name": "Jane Doe", "email": "jane@example.com", "password": "SecurePass123" }

// 201 Response
{
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "createdAt": "...", "updatedAt": "..." },
  "token": "eyJhbGciOi..."
}
```
`409` if the email is already registered.

### `POST /auth/login`
```json
// Request
{ "email": "jane@example.com", "password": "SecurePass123" }
// 200 Response: same shape as register
```
`401` on invalid credentials.

### `GET /auth/profile`
Returns `{ "user": {...} }` for the authenticated user.

### `PUT /auth/profile`
Body (all optional): `{ "name", "targetCompany", "bio" }`. Returns `{ "user": {...} }`.

### `PUT /auth/change-password`
```json
{ "currentPassword": "SecurePass123", "newPassword": "NewSecurePass456" }
```
`400` if `currentPassword` doesn't match.

---

## Problems (`/problems`)

### `GET /problems`
Query params (all optional): `page` (default 1), `limit` (default 10, max 100), `search` (matches title or topic), `platform`, `difficulty`, `status`, `topic`, `favorite` (`true` to only show favorites), `sortBy` (`createdAt|title|difficulty|solvedDate|timeSpentMinutes|topic`), `sortOrder` (`asc|desc`).

```json
{
  "data": [{ "id": 1, "title": "Two Sum", "platform": "LeetCode", "difficulty": "Easy", "topic": "Arrays",
             "status": "Solved", "notes": null, "solvedDate": "2026-08-01", "timeSpentMinutes": 15,
             "isFavorite": false, "createdAt": "...", "updatedAt": "..." }],
  "pagination": { "page": 1, "limit": 10, "total": 8, "totalPages": 1 }
}
```

### `GET /problems/:id` → `{ "data": {...} }` (`404` if not found/not owned)

### `POST /problems`
```json
{ "title": "Two Sum", "platform": "LeetCode", "difficulty": "Easy", "topic": "Arrays",
  "status": "Solved", "notes": null, "solvedDate": "2026-08-01", "timeSpentMinutes": 15 }
```
`platform` ∈ `LeetCode, GeeksforGeeks, HackerRank, CodeForces, CodeChef, Other`. `difficulty` ∈ `Easy, Medium, Hard`. `status` ∈ `Todo, Attempted, Solved` (default `Todo`). Returns `201` + `{ "data": {...} }`.

### `PUT /problems/:id` -- same fields, all optional (partial update).

### `DELETE /problems/:id` → `204`.

### `POST /problems/:id/favorite` -- toggles; returns `{ "data": { "problemId": 1, "isFavorite": true } }`.

---

## Contests (`/contests`)

### `GET /contests` -- query: `page`, `limit`, `platform`, `sortBy` (`contestDate|rating|rank|createdAt`), `sortOrder`. Same `{ data, pagination }` shape as problems.

### `GET /contests/rating-history` -- all contests, ascending by date, for charting:
```json
{ "data": [{ "id": 1, "name": "Weekly Contest 400", "platform": "LeetCode", "contestDate": "2026-07-01", "rating": 1450, "rank": 2300 }] }
```

### `POST /contests`
```json
{ "name": "Weekly Contest 400", "platform": "LeetCode", "contestDate": "2026-07-01", "rating": 1450, "rank": 2300, "problemsSolved": 2 }
```

### `PUT /contests/:id`, `DELETE /contests/:id` -- as above.

---

## Goals (`/goals`)

### `GET /goals` -- optional `?period=daily|weekly|monthly` filter.
```json
{
  "data": [{
    "id": 1, "period": "weekly", "title": "Arrays week", "targetTopic": "Arrays", "targetCount": 2,
    "startDate": "2026-08-01", "endDate": "2026-08-05",
    "progress": { "solvedCount": 2, "remaining": 0, "completionPercent": 100, "isComplete": true, "isExpired": false }
  }],
  "currentStreak": 3
}
```
`progress` is computed on every read from the `problems` table (count of `status = Solved` rows with `solvedDate` in range, filtered by `targetTopic` if set) -- it is never stored.

### `POST /goals`
```json
{ "period": "weekly", "title": "Arrays week", "targetTopic": "Arrays", "targetCount": 2, "startDate": "2026-08-01", "endDate": "2026-08-05" }
```
`targetTopic` is optional (omit to count problems of any topic). `400` if `endDate` is before `startDate`.

### `PUT /goals/:id`, `DELETE /goals/:id` -- as above.

---

## Analytics (`/analytics`)

### `GET /analytics/summary` -- the dashboard cards:
```json
{
  "data": {
    "totalSolved": 8,
    "difficulty": { "Easy": 2, "Medium": 4, "Hard": 2 },
    "currentStreak": 3,
    "weeklyConsistency": { "activeDays": 3, "totalDays": 7 },
    "goalCompletionPercent": 80,
    "activeDaysTotal": 7,
    "platformRanking": [{ "platform": "LeetCode", "bestRating": 1510 }]
  }
}
```
`currentStreak` counts backward from today (or yesterday, if today has no activity yet, so a streak isn't prematurely reset to 0 mid-day). `goalCompletionPercent` is `null` if there are no goals currently active (today between `startDate`/`endDate`).

### `GET /analytics/charts`
```json
{
  "data": {
    "monthlyTrend": [{ "month": "2026-08", "count": 8 }],
    "topicDistribution": [{ "topic": "Two Pointers", "count": 3 }],
    "difficultyBreakdown": [{ "difficulty": "Medium", "count": 4 }],
    "platformComparison": [{ "platform": "LeetCode", "count": 7 }],
    "ratingProgression": [{ "date": "2026-07-01", "rating": 1450, "platform": "LeetCode", "name": "Weekly Contest 400" }]
  }
}
```

### `GET /analytics/heatmap?year=2026`
```json
{ "data": [{ "date": "2026-08-01", "count": 1 }, { "date": "2026-08-03", "count": 2 }], "year": 2026 }
```
Only dates with at least one solve are included (sparse, not a full 365-row array) -- the frontend fills in the zero-count days when rendering the grid.

---

## AI Study Planner (`/ai`)

### `POST /ai/study-plan`
```json
{ "weakTopic": "Graphs", "targetCompany": "Google", "daysRemaining": 14 }
```
`targetCompany` is optional. `daysRemaining` must be `1-365`. Entirely rule-based (`backend/src/services/studyPlanService.js`) -- no external API call.

```json
{
  "data": {
    "weakTopic": "Graphs", "targetCompany": "Google", "daysRemaining": 14,
    "recommendedTopics": ["Graphs", "Dynamic Programming", "Trees", "..."],
    "roadmap": [{ "phase": "Foundation", "days": 4, "topics": ["..."], "difficultyMix": { "easy": 60, "medium": 35, "hard": 5 } }],
    "dailySchedule": [{ "day": 1, "phase": "Foundation", "topic": "Graphs", "problemsTarget": 3, "difficultyMix": {...}, "activity": "Learn/review Graphs concepts, then solve 3 problems (start Easy, build up)." }],
    "totalProblemsTarget": 42,
    "summary": "Focused 14-day plan starting with Graphs, weighted toward Google's most common interview topics."
  }
}
```

---

## Resume Mode (`/resume`)

### `GET /resume/summary`
```json
{
  "data": {
    "totalSolved": 8, "byPlatform": [{ "platform": "LeetCode", "count": 7 }],
    "strongestTopics": ["Two Pointers", "Arrays", "Sliding Window"],
    "difficultyBreakdown": { "Easy": 2, "Medium": 4, "Hard": 2 },
    "bestRatingByPlatform": { "LeetCode": 1510 }, "contestsCount": 2,
    "generatedText": "7 LeetCode, 1 GeeksforGeeks, strongest in Two Pointers & Arrays & Sliding Window."
  }
}
```
PDF export happens client-side (jsPDF) from this same data -- there is no separate PDF-generating endpoint.

---

## Health check

### `GET /health` -- no auth required. `{ "status": "ok" }`.
