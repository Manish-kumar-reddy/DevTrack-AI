export default function UpcomingRevisionsCard({ revisions }) {
  return (
    <div className="card">
      <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Upcoming Revisions (7 days)</h2>
      {revisions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Nothing coming up in the next week.</p>
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
              <span className="text-xs text-slate-400 dark:text-slate-500">{r.revisionDate}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
