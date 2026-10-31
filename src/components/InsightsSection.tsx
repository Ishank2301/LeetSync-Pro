import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { SubmissionItem } from "../types";
import { computeProductivityInsights } from "../utils/insightsEngine";

interface InsightsSectionProps {
  submissions: SubmissionItem[];
  dailyActivity: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  onNavigateToProblems?: () => void;
}

export default function InsightsSection({
  submissions,
  dailyActivity,
  currentStreak,
  longestStreak,
  onNavigateToProblems,
}: InsightsSectionProps) {
  const insights = useMemo(() => {
    return computeProductivityInsights(
      submissions,
      dailyActivity,
      currentStreak,
      longestStreak
    );
  }, [submissions, dailyActivity, currentStreak, longestStreak]);

  const {
    consistency,
    peakHour,
    peakTimeBlock,
    timeBlocks,
    hourlyDistribution,
    daysOfWeek,
    bestDay,
    personaTitle,
    recommendation,
    totalSubmissionsAnalyzed,
  } = insights;

  // Grade color scheme
  const gradeColors: Record<string, { text: string; bg: string; border: string }> = {
    S: { text: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", border: "#a855f7" },
    "A+": { text: "#22c55e", bg: "rgba(34, 197, 94, 0.15)", border: "#22c55e" },
    A: { text: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)", border: "#38bdf8" },
    B: { text: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "#f59e0b" },
    C: { text: "#fb923c", bg: "rgba(251, 146, 60, 0.15)", border: "#fb923c" },
    D: { text: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "#ef4444" },
  };

  const currentGradeStyle = gradeColors[consistency.grade] || gradeColors.B;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Header Hero Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #151a24 0%, #0d1117 100%)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color: "#f59e0b",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            BEHAVIORAL ANALYTICS & CIRCADIAN RHYTHM
          </div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Productivity & Consistency Insights
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              margin: "6px 0 0",
              maxWidth: 620,
              lineHeight: 1.5,
            }}
          >
            Continuous evaluation of your daily solving discipline, active window coverage, and optimal cognitive flow states.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "10px 14px",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
              Analyzed Solves
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", fontFamily: "var(--font-mono)" }}>
              {totalSubmissionsAnalyzed} submissions
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Dual Cards: Consistency Score & Peak Time */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
        }}
      >
        {/* Card A: Consistency Score */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  DISCIPLINE ENGINE
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", margin: "4px 0 0" }}>
                  Consistency Score
                </h3>
              </div>

              {/* Grade Pill */}
              <div
                style={{
                  background: currentGradeStyle.bg,
                  border: `1px solid ${currentGradeStyle.border}`,
                  color: currentGradeStyle.text,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  boxShadow: `0 0 12px ${currentGradeStyle.bg}`,
                }}
              >
                Grade {consistency.grade}
              </div>
            </div>

            {/* Score Numerical Indicator & Title */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color: currentGradeStyle.text,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {consistency.totalScore}
              </span>
              <span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 600 }}>/ 100</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ffffff",
                  background: "#1e293b",
                  padding: "3px 10px",
                  borderRadius: 6,
                  marginLeft: 6,
                }}
              >
                {consistency.statusTitle}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div
              style={{
                width: "100%",
                height: 8,
                background: "#1e2430",
                borderRadius: 4,
                overflow: "hidden",
                margin: "12px 0",
              }}
            >
              <div
                style={{
                  width: `${consistency.totalScore}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, #38bdf8 0%, ${currentGradeStyle.text} 100%)`,
                  borderRadius: 4,
                  transition: "width 0.8s ease-in-out",
                }}
              />
            </div>

            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, margin: "0 0 20px" }}>
              {consistency.summary}
            </p>
          </div>

          {/* Sub-Metrics Breakdown Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
              background: "#0c1017",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                Active Window (30d)
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                {consistency.activeDays30d} / 30 days
                <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: 6 }}>
                  ({consistency.coverageScore}/40 pts)
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                Streak Commitment
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                {currentStreak}d cur · {longestStreak}d best
                <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: 6 }}>
                  ({consistency.streakScore}/30 pts)
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                Cadence Stability
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                Regular pace
                <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: 6 }}>
                  ({consistency.regularityScore}/20 pts)
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                7-Day Velocity
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                {consistency.momentumScore >= 8 ? "↗ Expanding" : "⚡ Sustained"}
                <span style={{ fontSize: 10, color: "var(--accent)", marginLeft: 6 }}>
                  ({consistency.momentumScore}/10 pts)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Peak Productivity Time */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: "#f59e0b",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  CIRCADIAN FOCUS CURVE
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", margin: "4px 0 0" }}>
                  Peak Productivity Time
                </h3>
              </div>

              <div
                style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  color: "#f59e0b",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span>{peakTimeBlock.icon}</span>
                <span>{peakTimeBlock.shortName}</span>
              </div>
            </div>

            {/* Peak Window Big Display */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color: "#f59e0b",
                  letterSpacing: "-0.02em",
                }}
              >
                {peakHour.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginTop: 2 }}>
                Persona: <strong style={{ color: "#ffffff" }}>{personaTitle}</strong>
              </div>
            </div>

            {/* Actionable Advice Box */}
            <div
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                borderRadius: 10,
                padding: "12px 14px",
                margin: "12px 0 16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: "#f59e0b",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                <span>💡 Recommended Solving Window</span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "#e2e8f0",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {recommendation}
              </p>
            </div>
          </div>

          {/* Quick Metrics Footer */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
              background: "#0c1017",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                Top Solving Day
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                {bestDay.dayName} ({bestDay.count} solves)
                <span style={{ fontSize: 10, color: "#f59e0b", marginLeft: 6 }}>
                  {bestDay.percentage}%
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
                Window Concentration
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>
                {peakTimeBlock.percentage}% during flow
                <span style={{ fontSize: 10, color: "#22c55e", marginLeft: 6 }}>
                  {peakTimeBlock.count} solves
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Hourly Solving Distribution (24-Hour Timeline) */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              24-HOUR CIRCADIAN HEATMAP
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "4px 0 0" }}>
              Submission Frequency by Hour of Day
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
              Shows when you are most active and likely to complete complex algorithm challenges.
            </p>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 11 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#f59e0b" }} />
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>Peak Hour ({peakHour.label})</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: "#38bdf8" }} />
              <span style={{ color: "var(--muted)" }}>Standard Output</span>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof hourlyDistribution[0];
                    return (
                      <div
                        style={{
                          background: "#0f172a",
                          border: "1px solid #334155",
                          borderRadius: 8,
                          padding: "8px 12px",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                          fontSize: 12,
                        }}
                      >
                        <div style={{ color: "#f8fafc", fontWeight: 700 }}>
                          {data.label} (Hour {data.hour}:00)
                        </div>
                        <div
                          style={{
                            color: data.isPeak ? "#f59e0b" : "#38bdf8",
                            fontWeight: 600,
                            marginTop: 3,
                          }}
                        >
                          {data.count} problem{data.count === 1 ? "" : "s"} solved
                          {data.isPeak && " ⭐ Peak Activity"}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {hourlyDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isPeak ? "#f59e0b" : entry.count > 0 ? "#38bdf8" : "#1e293b"}
                    fillOpacity={entry.isPeak ? 1 : entry.count > 0 ? 0.85 : 0.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Bottom Grid: Time Blocks & Days of Week Breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {/* Time Blocks Distribution */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "22px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", margin: "0 0 16px" }}>
            Circadian Time Blocks
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {timeBlocks.map((block) => {
              const isDominant = block.name === peakTimeBlock.name;
              return (
                <div
                  key={block.name}
                  style={{
                    background: isDominant ? "rgba(245, 158, 11, 0.08)" : "#0c1017",
                    border: isDominant ? "1px solid rgba(245, 158, 11, 0.35)" : "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span>{block.icon}</span>
                      <strong style={{ color: isDominant ? "#f59e0b" : "#f8fafc" }}>
                        {block.shortName}
                      </strong>
                      <span style={{ fontSize: 10, color: "var(--muted)" }}>({block.range})</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: isDominant ? "#f59e0b" : "#f8fafc" }}>
                      {block.count} ({block.percentage}%)
                    </div>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      height: 5,
                      background: "#1e2430",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${block.percentage}%`,
                        height: "100%",
                        background: isDominant ? "#f59e0b" : "#38bdf8",
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Days of Week Distribution */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "22px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Day of Week Activity
            </h4>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "#22c55e",
                background: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              Peak: {bestDay.dayName}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {daysOfWeek.map((day) => {
              return (
                <div
                  key={day.dayName}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      width: 32,
                      color: day.isBestDay ? "#f59e0b" : "var(--muted)",
                      fontWeight: day.isBestDay ? 800 : 600,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {day.dayName}
                  </span>

                  <div
                    style={{
                      flex: 1,
                      height: 14,
                      background: "#0c1017",
                      border: "1px solid var(--border)",
                      borderRadius: 4,
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.max(day.percentage, day.count > 0 ? 8 : 0)}%`,
                        height: "100%",
                        background: day.isBestDay
                          ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                          : "linear-gradient(90deg, #1e3a8a, #38bdf8)",
                        borderRadius: 3,
                      }}
                    />
                  </div>

                  <span
                    style={{
                      width: 50,
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: day.isBestDay ? "#f59e0b" : "var(--muted)",
                      fontWeight: day.isBestDay ? 700 : 500,
                    }}
                  >
                    {day.count} {day.count === 1 ? "pb" : "pbs"}
                  </span>
                </div>
              );
            })}
          </div>

          {onNavigateToProblems && (
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                onClick={onNavigateToProblems}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--accent)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>Browse All Synced Problems</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
