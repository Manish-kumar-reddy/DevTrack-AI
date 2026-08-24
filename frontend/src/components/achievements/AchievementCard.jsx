import { motion } from "framer-motion";

export default function AchievementCard({ achievement }) {
  const { title, description, icon, unlocked, unlockedAt } = achievement;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card flex flex-col items-center gap-3 text-center transition-all ${
        unlocked ? "" : "opacity-50 grayscale"
      }`}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
          unlocked
            ? "bg-gradient-to-br from-amber-100 to-brand-100 dark:from-amber-500/20 dark:to-brand-500/20"
            : "bg-slate-100 dark:bg-white/5"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      {unlocked ? (
        <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          Unlocked {new Date(unlockedAt).toLocaleDateString()}
        </span>
      ) : (
        <span className="badge bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400">Locked</span>
      )}
    </motion.div>
  );
}
