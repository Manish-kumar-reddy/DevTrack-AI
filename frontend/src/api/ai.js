import client from "./client";

export const generateStudyPlan = (payload) => client.post("/ai/study-plan", payload).then((r) => r.data);
