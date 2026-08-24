export default function TopicInsightCard({ strongestTopic, weakestTopic }) {
  return (
    <div className="card space-y-4">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Topic Insight</h2>

      <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
        <div>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">💪 Strongest Topic</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {strongestTopic ? strongestTopic.topic : "Not enough data yet"}
          </p>
        </div>
        {strongestTopic && (
          <span className="text-xs text-emerald-700 dark:text-emerald-400">{strongestTopic.solved} solved</span>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
        <div>
          <p className="text-xs text-amber-700 dark:text-amber-400">🎯 Weakest Topic</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {weakestTopic ? weakestTopic.topic : "Not enough data yet"}
          </p>
        </div>
        {weakestTopic && (
          <span className="text-xs text-amber-700 dark:text-amber-400">{weakestTopic.solveRate}% solve rate</span>
        )}
      </div>
    </div>
  );
}
