export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50/60 dark:bg-red-500/5 py-14 px-6 text-center animate-fade-in">
      <div className="mb-3 text-3xl">⚠️</div>
      <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-red-600/80 dark:text-red-400/70">{message || "Please try again."}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          Retry
        </button>
      )}
    </div>
  );
}
