import { useEffect, useState } from "react";
import * as achievementsApi from "../api/achievements";
import AchievementCard from "../components/achievements/AchievementCard";
import ErrorState from "../components/ui/ErrorState";
import { CardSkeleton } from "../components/ui/Skeleton";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    achievementsApi
      .listAchievements()
      .then(({ data }) => setAchievements(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load achievements."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">🏆 Achievements</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {loading ? "Loading..." : `${unlockedCount} of ${achievements.length} badges unlocked`}
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
          : achievements.map((a) => <AchievementCard key={a.key} achievement={a} />)}
      </div>
    </div>
  );
}
