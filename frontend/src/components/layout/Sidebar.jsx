import { NavLink } from "react-router-dom";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "🏠", end: true },
  { to: "/problems", label: "Problems", icon: "📝" },
  { to: "/contests", label: "Contests", icon: "🏆" },
  { to: "/goals", label: "Goals", icon: "🎯" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/ai-planner", label: "AI Study Planner", icon: "✨" },
  { to: "/resume", label: "Resume Mode", icon: "📄" },
  { to: "/achievements", label: "Achievements", icon: "🎖️" },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0b0e14]/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold">
            D
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">DevTrack AI</span>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                )
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
