const COLOR_MAP = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  Solved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Attempted: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Todo: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  default: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
};

export default function Badge({ children, tone }) {
  const classes = COLOR_MAP[tone] || COLOR_MAP.default;
  return <span className={`badge ${classes}`}>{children}</span>;
}
