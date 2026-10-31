import React, { useMemo } from "react";
import { SubmissionItem } from "../types";
import { computeProductivityInsights } from "../utils/insightsEngine";

interface InsightsHighlightCardProps {
  submissions: SubmissionItem[];
  dailyActivity: Record<string, number>;
  currentStreak: number;
  longestStreak: number;
  onOpenFullInsights: () => void;
}

export default function InsightsHighlightCard({
  submissions,
  dailyActivity,
  currentStreak,
  longestStreak,
  onOpenFullInsights,
}: InsightsHighlightCardProps) {
  const insights = useMemo(() => {
    return computeProductivityInsights(
      submissions,
      dailyActivity,
      currentStreak,
      longestStreak
    );
  }, [submissions, dailyActivity, currentStreak, longestStreak]);

  const { consistency, peakHour, peakTimeBlock, recommendation, personaTitle } =
    insights;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              color: "#f59e0b",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "rgba(245, 158, 11, 0.12)",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            AI INSIGHTS & BEHAVIOR
          </span>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
            }}
          >
            Consistency & Circadian Solving Insights
          </h3>
        </div>

        <button
          onClick={onOpenFullInsights}
          style={{
            background: "#1e293b",
            border: "1px solid var(--border)",
            color: "#38bdf8",
            borderRadius: 6,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
          aria-label="View Full Insights Tab"
        >
          <span>View Deep Insights</span>
          <span>→</span>
        </button>
      </div>

      {/* Two Column Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {/* Consistency Score Pill */}
        <div
          style={{
            background: "#0c1017",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
              Consistency Score
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  color: "#22c55e",
                }}
              >
                {consistency.totalScore}
              </span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>/ 100</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#22c55e",
                  background: "rgba(34, 197, 94, 0.15)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  marginLeft: 4,
                }}
              >
                {consistency.grade} · {consistency.statusTitle}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {consistency.activeDays30d} active days in past 30-day window
            </div>
          </div>
        </div>

        {/* Peak Productivity Time Pill */}
        <div
          style={{
            background: "#0c1017",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase" }}>
            Peak Productivity Window
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                color: "#f59e0b",
              }}
            >
              {peakHour.label}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#e2e8f0",
                background: "rgba(245, 158, 11, 0.12)",
                padding: "2px 8px",
                borderRadius: 4,
              }}
            >
              {peakTimeBlock.shortName}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            Persona: <strong style={{ color: "#ffffff" }}>{personaTitle}</strong> ({peakTimeBlock.percentage}% solve concentration)
          </div>
        </div>
      </div>

      {/* Recommendation Snippet */}
      <div
        style={{
          background: "rgba(56, 189, 248, 0.06)",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          borderRadius: 8,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 12,
          color: "#e2e8f0",
        }}
      >
        <span style={{ fontSize: 16 }}>🎯</span>
        <span style={{ flex: 1 }}>{recommendation}</span>
      </div>
    </div>
  );
}
