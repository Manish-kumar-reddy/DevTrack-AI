import Badge from "../ui/Badge";

export default function RecentlySolvedCard({ problems }) {
  return (
    <div className="card">
      <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">Recently Solved</h2>
      {problems.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No solved problems yet.</p>
      ) : (
        <div className="space-y-2">
          {problems.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-3.5 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {p.platform} · {p.topic} · {p.solvedDate}
                </p>
              </div>
              <Badge tone={p.difficulty}>{p.difficulty}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
