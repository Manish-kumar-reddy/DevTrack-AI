const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function intensityClass(count) {
  if (count === 0) return "bg-slate-100 dark:bg-white/5";
  if (count === 1) return "bg-brand-200 dark:bg-brand-900/60";
  if (count <= 3) return "bg-brand-400 dark:bg-brand-700";
  if (count <= 5) return "bg-brand-600 dark:bg-brand-500";
  return "bg-brand-800 dark:bg-brand-400";
}

/** Builds a Sun-Sat grid of weeks covering Jan 1 - Dec 31 of `year`. */
function buildWeeks(year) {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  const startDay = start.getUTCDay();
  const gridStart = new Date(start);
  gridStart.setUTCDate(gridStart.getUTCDate() - startDay);

  const weeks = [];
  let cursor = new Date(gridStart);
  while (cursor <= end) {
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      week.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function ActivityHeatmap({ data, year }) {
  const countByDate = Object.fromEntries(data.map((d) => [d.date, d.count]));
  const weeks = buildWeeks(year);
  const totalActive = data.filter((d) => d.count > 0).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{totalActive} active days in {year}</span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {[0, 1, 2, 4, 6].map((c) => (
            <span key={c} className={`h-2.5 w-2.5 rounded-sm ${intensityClass(c)}`} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((date) => {
                const inYear = date.getUTCFullYear() === year;
                const key = toDateKey(date);
                const count = countByDate[key] || 0;
                return (
                  <div
                    key={key}
                    title={inYear ? `${key}: ${count} solved` : ""}
                    className={`h-2.5 w-2.5 rounded-sm ${inYear ? intensityClass(count) : "bg-transparent"}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
        {MONTH_LABELS.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}
