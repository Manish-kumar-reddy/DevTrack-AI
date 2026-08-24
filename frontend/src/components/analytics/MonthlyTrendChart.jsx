import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MonthlyTrendChart({ data }) {
  if (data.length === 0) return <EmptyChart text="Solve problems to see your monthly trend." />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: 13 }} />
        <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fill="url(#trendFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function EmptyChart({ text }) {
  return <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">{text}</div>;
}
