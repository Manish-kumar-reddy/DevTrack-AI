import client from "./client";

export const getResumeSummary = () => client.get("/resume/summary").then((r) => r.data);
