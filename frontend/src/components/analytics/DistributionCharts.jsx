import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { EmptyChart } from "./MonthlyTrendChart";

const DIFFICULTY_COLORS = { Easy: "#10b981", Medium: "#f59e0b", Hard: "#ef4444" };
const PALETTE = ["#6366f1", "#8b5cf6", "#ec4899", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export function DifficultyPieChart({ data }) {
  const chartData = data.filter((d) => d.count > 0);
  if (chartData.length === 0) return <EmptyChart text="No solved problems yet." />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="count" nameKey="difficulty" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {chartData.map((d) => (
            <Cell key={d.difficulty} fill={DIFFICULTY_COLORS[d.difficulty]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: 13 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TopicDistributionChart({ data }) {
  const chartData = data.slice(0, 8);
  if (chartData.length === 0) return <EmptyChart text="Solve problems across topics to see your distribution." />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 36)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="topic" stroke="#94a3b8" fontSize={12} width={110} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: 13 }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PlatformComparisonChart({ data }) {
  if (data.length === 0) return <EmptyChart text="Solve problems on different platforms to compare here." />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b833" />
        <XAxis dataKey="platform" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: 13 }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
