import { motion } from "framer-motion";

const PERIOD_COLORS = {
  daily: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  weekly: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
  monthly: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export default function GoalCard({ goal, onEdit, onDelete }) {
  const showActions = Boolean(onEdit || onDelete);
  const { progress } = goal;
  const barColor = progress.isComplete ? "bg-emerald-500" : progress.isExpired ? "bg-red-400" : "bg-brand-500";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <span className={`badge ${PERIOD_COLORS[goal.period]}`}>{goal.period}</span>
          <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{goal.title}</h3>
          {goal.targetTopic && <p className="text-xs text-slate-500 dark:text-slate-400">Topic: {goal.targetTopic}</p>}
        </div>
        {progress.isComplete && <span className="text-xl">✅</span>}
        {progress.isExpired && !progress.isComplete && <span className="text-xl">⏰</span>}
      </div>

      <div>
        <div className="mb-1.5 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            {progress.solvedCount} / {goal.targetCount} solved
          </span>
          <span>{progress.completionPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress.completionPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>
          {goal.startDate} → {goal.endDate}
        </span>
        {showActions && (
          <div className="flex gap-3">
            {onEdit && (
              <button className="hover:text-brand-600 dark:hover:text-brand-400" onClick={() => onEdit(goal)}>
                Edit
              </button>
            )}
            {onDelete && (
              <button className="hover:text-red-500" onClick={() => onDelete(goal)}>
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
