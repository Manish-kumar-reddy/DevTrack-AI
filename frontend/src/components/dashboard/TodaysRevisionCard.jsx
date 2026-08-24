import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as revisionsApi from "../../api/revisions";
import Skeleton from "../ui/Skeleton";

export default function TodaysRevisionCard() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    revisionsApi
      .getTodaysRevisions()
      .then(({ data }) => setRevisions(data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleComplete(id) {
    try {
      await revisionsApi.completeRevision(id);
      setRevisions((prev) => prev.filter((r) => r.id !== id));
      toast.success("Marked as revised.");
    } catch {
      toast.error("Failed to update revision.");
    }
  }

  return (
    <div className="card">
      <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">📅 Today's Revision</h2>
      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : revisions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Nothing scheduled for revision today.</p>
      ) : (
        <div className="space-y-2">
          {revisions.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-3.5 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{r.problem.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {r.problem.platform} · {r.intervalDays}-day revision
                </p>
              </div>
              <button className="btn-secondary px-2.5 py-1 text-xs" onClick={() => handleComplete(r.id)}>
                Mark Done
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
