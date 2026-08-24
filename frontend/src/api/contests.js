import client from "./client";

export const listContests = (params) => client.get("/contests", { params }).then((r) => r.data);
export const getRatingHistory = () => client.get("/contests/rating-history").then((r) => r.data);
export const createContest = (payload) => client.post("/contests", payload).then((r) => r.data);
export const updateContest = (id, payload) => client.put(`/contests/${id}`, payload).then((r) => r.data);
export const deleteContest = (id) => client.delete(`/contests/${id}`);

export const CONTEST_PLATFORMS = ["LeetCode", "CodeForces", "CodeChef", "HackerRank", "AtCoder", "Other"];
