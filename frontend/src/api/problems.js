import client from "./client";

export const listProblems = (params) => client.get("/problems", { params }).then((r) => r.data);
export const getProblem = (id) => client.get(`/problems/${id}`).then((r) => r.data);
export const createProblem = (payload) => client.post("/problems", payload).then((r) => r.data);
export const updateProblem = (id, payload) => client.put(`/problems/${id}`, payload).then((r) => r.data);
export const deleteProblem = (id) => client.delete(`/problems/${id}`);
export const toggleFavorite = (id) => client.post(`/problems/${id}/favorite`).then((r) => r.data);

export const PLATFORMS = ["LeetCode", "GeeksforGeeks", "HackerRank", "CodeForces", "CodeChef", "Other"];
export const DIFFICULTIES = ["Easy", "Medium", "Hard"];
export const STATUSES = ["Todo", "Attempted", "Solved"];
