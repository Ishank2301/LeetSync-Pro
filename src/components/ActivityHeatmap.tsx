import React from "react";

interface ActivityHeatmapProps {
  dailyActivity: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
}

export default function ActivityHeatmap({
  dailyActivity = {},
  currentStreak = 0,
  longestStreak = 0,
}: ActivityHeatmapProps) {
  // Generate the last 16 weeks (112 days)
  const days: { dateStr: string; dayOfWeek: number; count: number; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // End on current week's Saturday
  const endDay = new Date(today);
  const dayOffset = 6 - endDay.getDay(); // days until Saturday
  endDay.setDate(endDay.getDate() + dayOffset);

  const totalDays = 16 * 7; // 16 weeks
  const startDate = new Date(endDay);
  startDate.setDate(startDate.getDate() - (totalDays - 1));

  const curr = new Date(startDate);
  while (curr <= endDay) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, "0");
    const d = String(curr.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    const count = dailyActivity[dateStr] || 0;
    const label = curr.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    days.push({
      dateStr,
      dayOfWeek: curr.getDay(),
      count,
      label,
    });

    curr.setDate(curr.getDate() + 1);
  }

  // Split into 16 weeks of 7 days
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  function getColor(count: number): string {
    if (count === 0) return "#161e2e";
    if (count === 1) return "#0e4429";
    if (count === 2) return "#006d32";
    if (count === 3) return "#26a641";
    return "#39d353";
  }

  const totalSubmissions = Object.values(dailyActivity).reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--muted)",
              letterSpacing: "0.08em",
            }}
          >
            SUBMISSION ACTIVITY
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text)",
              background: "var(--surface2)",
              padding: "2px 8px",
              borderRadius: 4,
              border: "1px solid var(--border)",
            }}
          >
            {totalSubmissions} submissions in past 16 weeks
          </span>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ color: "var(--muted)" }}>Streak:</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#f89f1b" }}>
              🔥 {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ color: "var(--muted)" }}>Best:</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--easy)" }}>
              ⚡ {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </span>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--muted)" }}>
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((c) => (
              <div
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: getColor(c),
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "flex", gap: 4, minWidth: 500 }}>
          {weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {week.map((d) => (
                <div
                  key={d.dateStr}
                  title={`${d.count} submissions on ${d.label}`}
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 2,
                    background: getColor(d.count),
                    border: "1px solid rgba(255,255,255,0.04)",
                    transition: "transform 0.1s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.3)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
