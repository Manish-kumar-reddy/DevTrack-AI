import client from "./client";

export const listGoals = (params) => client.get("/goals", { params }).then((r) => r.data);
export const createGoal = (payload) => client.post("/goals", payload).then((r) => r.data);
export const updateGoal = (id, payload) => client.put(`/goals/${id}`, payload).then((r) => r.data);
export const deleteGoal = (id) => client.delete(`/goals/${id}`);

export const GOAL_PERIODS = ["daily", "weekly", "monthly"];
