import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const DIFF_COLORS = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

const CAT_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f89f1b",
  "#22c55e", "#06b6d4", "#f59e0b", "#ef4444",
  "#a3e635", "#e879f9",
];

export function DifficultyPie({ data }) {
  const entries = Object.entries(data || {})
    .map(([name, value]) => ({ name, value }))
    .filter((e) => e.value > 0);

  if (!entries.length) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={entries} cx="50%" cy="50%" outerRadius={75} innerRadius={42} dataKey="value" label={({ name, value }) => `${name} ${value}`} labelLine={false}>
          {entries.map((e) => (
            <Cell key={e.name} fill={DIFF_COLORS[e.name] || "#64748b"} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1e2d42", borderRadius: 6 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CategoryBar({ data }) {
  const entries = Object.entries(data || {})
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (!entries.length) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={entries} layout="vertical" margin={{ left: 16, right: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#94a3b8", fontSize: 12, fontFamily: "var(--font-sans)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#111827", border: "1px solid #1e2d42", borderRadius: 6 }} cursor={{ fill: "#1e2d4233" }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {entries.map((_, i) => (
            <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Empty() {
  return (
    <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 13 }}>
      No data yet — start solving!
    </div>
  );
}
