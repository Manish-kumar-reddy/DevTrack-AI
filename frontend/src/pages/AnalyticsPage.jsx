import { useEffect, useState } from "react";
import * as analyticsApi from "../api/analytics";
import MonthlyTrendChart from "../components/analytics/MonthlyTrendChart";
import { DifficultyPieChart, TopicDistributionChart, PlatformComparisonChart } from "../components/analytics/DistributionCharts";
import ActivityHeatmap from "../components/analytics/ActivityHeatmap";
import RatingChart from "../components/contests/RatingChart";
import ErrorState from "../components/ui/ErrorState";
import Skeleton from "../components/ui/Skeleton";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export default function AnalyticsPage() {
  const [charts, setCharts] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    analyticsApi
      .getCharts()
      .then(({ data }) => setCharts(data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load analytics."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  useEffect(() => {
    setHeatmapLoading(true);
    analyticsApi
      .getHeatmap(year)
      .then(({ data }) => setHeatmap(data))
      .finally(() => setHeatmapLoading(false));
  }, [year]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Deep dive into your solving patterns.</p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card">
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && charts && (
        <>
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Activity Heatmap</h2>
              <select className="input w-auto py-1.5 text-xs" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            {heatmapLoading ? <Skeleton className="h-32 w-full" /> : <ActivityHeatmap data={heatmap || []} year={year} />}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card">
              <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Monthly Solving Trend</h2>
              <MonthlyTrendChart data={charts.monthlyTrend} />
            </div>
            <div className="card">
              <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Difficulty Breakdown</h2>
              <DifficultyPieChart data={charts.difficultyBreakdown} />
            </div>
            <div className="card">
              <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Topic Distribution</h2>
              <TopicDistributionChart data={charts.topicDistribution} />
            </div>
            <div className="card">
              <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Platform Comparison</h2>
              <PlatformComparisonChart data={charts.platformComparison} />
            </div>
          </div>

          <div className="card">
            <h2 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">Rating Progression</h2>
            <RatingChart data={charts.ratingProgression.map((r) => ({ contestDate: r.date, rating: r.rating }))} />
          </div>
        </>
      )}
    </div>
  );
}
