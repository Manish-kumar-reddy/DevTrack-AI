import client from "./client";

export const getTodaysRevisions = () => client.get("/revisions/today").then((r) => r.data);
export const getUpcomingRevisions = (days) => client.get("/revisions/upcoming", { params: { days } }).then((r) => r.data);
export const completeRevision = (id) => client.patch(`/revisions/${id}/complete`).then((r) => r.data);
