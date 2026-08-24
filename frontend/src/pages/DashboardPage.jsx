import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getSummary } from "../api/analytics";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/dashboard/StatCard";
import { CardSkeleton } from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    getSummary()
      .then(({ data }) => setSummary(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here's your coding progress at a glance.</p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && summary && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Solved" value={summary.totalSolved} icon="✅" accent="brand" />
            <StatCard label="Easy" value={summary.difficulty.Easy} icon="🟢" accent="emerald" />
            <StatCard label="Medium" value={summary.difficulty.Medium} icon="🟡" accent="amber" />
            <StatCard label="Hard" value={summary.difficulty.Hard} icon="🔴" accent="red" />
            <StatCard
              label="Current Streak"
              value={summary.currentStreak}
              suffix=" days"
              icon="🔥"
              accent="amber"
              subtitle={summary.currentStreak > 0 ? "Keep it going!" : "Solve today to start a streak"}
            />
            <StatCard
              label="Weekly Consistency"
              value={summary.weeklyConsistency.activeDays}
              suffix={`/${summary.weeklyConsistency.totalDays} days`}
              icon="📅"
              accent="brand"
            />
            <StatCard
              label="Goal Completion"
              value={summary.goalCompletionPercent ?? "—"}
              suffix={summary.goalCompletionPercent !== null ? "%" : ""}
              icon="🎯"
              accent="emerald"
              subtitle={summary.goalCompletionPercent === null ? "No active goals" : "Across active goals"}
            />
            <StatCard label="Active Days" value={summary.activeDaysTotal} icon="📈" accent="brand" />
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="card">
            <h2 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">Platform Ranking</h2>
            {summary.platformRanking.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No contest ratings yet.{" "}
                <Link to="/contests" className="text-brand-600 hover:underline dark:text-brand-400">
                  Log a contest
                </Link>{" "}
                to see your ranking here.
              </p>
            ) : (
              <div className="space-y-3">
                {summary.platformRanking.map((p, i) => (
                  <div key={p.platform} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.platform}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.bestRating}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
