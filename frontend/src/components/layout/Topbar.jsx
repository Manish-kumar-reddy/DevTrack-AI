import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-[#0b0e14]/80 backdrop-blur-xl px-4 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <Link
          to="/profile"
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">{user?.name}</span>
        </Link>
        <button onClick={logout} className="btn-ghost px-3 py-1.5 text-xs">
          Logout
        </button>
      </div>
    </header>
  );
}
