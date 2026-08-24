import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center dark:bg-[#0b0e14]">
      <p className="text-6xl">🧭</p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}
