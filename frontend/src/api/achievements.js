import client from "./client";

export const listAchievements = () => client.get("/achievements").then((r) => r.data);
