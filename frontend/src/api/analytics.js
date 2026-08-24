import client from "./client";

export const getSummary = () => client.get("/analytics/summary").then((r) => r.data);
export const getCharts = () => client.get("/analytics/charts").then((r) => r.data);
export const getHeatmap = (year) => client.get("/analytics/heatmap", { params: { year } }).then((r) => r.data);
