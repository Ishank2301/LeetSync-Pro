import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  computeMovingAverageData,
  computeTrendSummary,
} from "../utils/activityTrends";

interface MovingAverageCardProps {
  dailyActivity: Record<string, number>;
}

export default function MovingAverageCard({ dailyActivity = {} }: MovingAverageCardProps) {
  const [rangeDays, setRangeDays] = useState<14 | 30 | 60>(30);

  const trendData = useMemo(() => {
    return computeMovingAverageData(dailyActivity, rangeDays);
  }, [dailyActivity, rangeDays]);

  const summary = useMemo(() => {
    return computeTrendSummary(trendData);
  }, [trendData]);

  // Determine trend color and arrow symbol
  const isUp = summary.trendDirection === "up";
  const isDown = summary.trendDirection === "down";
  const trendColor = isUp ? "var(--easy, #22c55e)" : isDown ? "#ef4444" : "var(--muted, #64748b)";
  const trendBg = isUp ? "rgba(34, 197, 94, 0.12)" : isDown ? "rgba(239, 68, 68, 0.12)" : "rgba(100, 116, 139, 0.12)";
  const trendArrow = isUp ? "↗" : isDown ? "↘" : "→";

  return (
    <div
      style={{
        background: "var(--surface, #111827)",
        border: "1px solid var(--border, #1e2d42)",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Top Header: Title, Category Badge, and Time Range Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                color: "var(--accent, #f89f1b)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              PRODUCTIVITY TRENDS
            </span>
            <span
              style={{
                background: "rgba(248, 159, 27, 0.12)",
                color: "var(--accent, #f89f1b)",
                fontSize: 10,
                fontFamily: "var(--font-mono, monospace)",
                padding: "1px 6px",
                borderRadius: 4,
                border: "1px solid rgba(248, 159, 27, 0.25)",
              }}
            >
              7-DAY ROLLING
            </span>
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text, #e2e8f0)",
              letterSpacing: "-0.01em",
            }}
          >
            7-Day Moving Average
          </h3>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 12,
              color: "var(--muted, #64748b)",
              lineHeight: 1.4,
            }}
          >
            Smoothes day-to-day volatility to highlight sustained problem-solving momentum and velocity.
          </p>
        </div>

        {/* Time Window Buttons */}
        <div
          style={{
            display: "inline-flex",
            background: "var(--surface2, #1a2233)",
            borderRadius: 7,
            padding: 3,
            border: "1px solid var(--border, #1e2d42)",
            gap: 2,
          }}
        >
          {([14, 30, 60] as const).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRangeDays(days)}
              style={{
                background: rangeDays === days ? "var(--border, #1e2d42)" : "transparent",
                color: rangeDays === days ? "var(--text, #e2e8f0)" : "var(--muted, #64748b)",
                border: "none",
                borderRadius: 5,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "var(--font-mono, monospace)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
          background: "var(--surface2, #1a2233)",
          border: "1px solid var(--border, #1e2d42)",
          borderRadius: 8,
          padding: "14px 16px",
        }}
      >
        {/* Metric 1: Current Moving Average */}
        <div>
          <span
            style={{
              display: "block",
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--muted, #64748b)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Current Velocity
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--accent, #f89f1b)",
                lineHeight: 1.1,
              }}
            >
              {summary.current7dAvg}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted, #64748b)" }}>probs/day</span>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              marginTop: 4,
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
              color: trendColor,
              background: trendBg,
              padding: "1px 6px",
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            {trendArrow} {Math.abs(summary.percentChange)}% vs prior 7d
          </span>
        </div>

        {/* Metric 2: 7-Day Window Total */}
        <div>
          <span
            style={{
              display: "block",
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--muted, #64748b)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Last 7 Days
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--text, #e2e8f0)",
                lineHeight: 1.1,
              }}
            >
              {summary.current7dTotal}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted, #64748b)" }}>solved</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted, #64748b)", marginTop: 4, display: "block" }}>
            Prior 7d: {summary.previous7dTotal} solved
          </span>
        </div>

        {/* Metric 3: Peak Volume Day */}
        <div>
          <span
            style={{
              display: "block",
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--muted, #64748b)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Peak Daily Output
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontFamily: "var(--font-mono, monospace)",
                color: "#38bdf8",
                lineHeight: 1.1,
              }}
            >
              {summary.peakDailyCount}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted, #64748b)" }}>in one day</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted, #64748b)", marginTop: 4, display: "block" }}>
            on {summary.peakDateLabel}
          </span>
        </div>

        {/* Metric 4: Active Consistency */}
        <div>
          <span
            style={{
              display: "block",
              fontSize: 10,
              fontFamily: "var(--font-mono, monospace)",
              color: "var(--muted, #64748b)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Active Days
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontFamily: "var(--font-mono, monospace)",
                color: "var(--easy, #22c55e)",
                lineHeight: 1.1,
              }}
            >
              {summary.activeDaysInWindow}
            </span>
            <span style={{ fontSize: 11, color: "var(--muted, #64748b)" }}>/ {summary.totalDaysInWindow} days</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--muted, #64748b)", marginTop: 4, display: "block" }}>
            {Math.round((summary.activeDaysInWindow / (summary.totalDaysInWindow || 1)) * 100)}% consistency
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div style={{ width: "100%", height: 240, marginTop: 4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="maGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f89f1b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f89f1b" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d42" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-sans, sans-serif)" }}
              axisLine={{ stroke: "#1e2d42" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />

            <YAxis
              tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono, monospace)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={true}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div
                      style={{
                        background: "#0d1117",
                        border: "1px solid #1e2d42",
                        borderRadius: 8,
                        padding: "10px 14px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                        fontSize: 12,
                        minWidth: 170,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "var(--text, #e2e8f0)",
                          marginBottom: 6,
                          borderBottom: "1px solid #1e2d42",
                          paddingBottom: 4,
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{data.label}</span>
                        <span style={{ color: "var(--muted, #64748b)", fontFamily: "var(--font-mono, monospace)" }}>
                          {data.date}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: "#94a3b8" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 8, height: 8, background: "#38bdf8", borderRadius: 2 }} />
                          Daily Solved:
                        </span>
                        <strong style={{ color: "#ffffff", fontFamily: "var(--font-mono, monospace)" }}>
                          {data.count}
                        </strong>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", margin: "4px 0", color: "var(--accent, #f89f1b)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 8, height: 8, background: "var(--accent, #f89f1b)", borderRadius: "50%" }} />
                          7-Day Rolling Avg:
                        </span>
                        <strong style={{ fontFamily: "var(--font-mono, monospace)" }}>
                          {data.movingAvg7d} / day
                        </strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Daily solves bars */}
            <Bar
              dataKey="count"
              name="Daily Solved"
              fill="#38bdf8"
              opacity={0.45}
              radius={[3, 3, 0, 0]}
              barSize={rangeDays === 60 ? 4 : rangeDays === 30 ? 8 : 16}
            />

            {/* 7-Day Moving Average Line */}
            <Line
              type="monotone"
              dataKey="movingAvg7d"
              name="7-Day Moving Avg"
              stroke="#f89f1b"
              strokeWidth={2.8}
              dot={rangeDays === 14}
              activeDot={{ r: 5, fill: "#f89f1b", stroke: "#0d1117", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & Explanation Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          paddingTop: 8,
          borderTop: "1px solid #16202f",
          fontSize: 11,
          color: "var(--muted, #64748b)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 12,
                height: 3,
                background: "var(--accent, #f89f1b)",
                borderRadius: 2,
              }}
            />
            <span>7-Day Moving Average (Trend line)</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                background: "#38bdf8",
                opacity: 0.5,
                borderRadius: 2,
              }}
            />
            <span>Daily Solves</span>
          </div>
        </div>

        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10 }}>
          {summary.trendDirection === "up" ? (
            <span style={{ color: "var(--easy, #22c55e)" }}>🔥 Velocity expanding</span>
          ) : summary.trendDirection === "down" ? (
            <span style={{ color: "#f59e0b" }}>⚡ Pace tapering — time to solve!</span>
          ) : (
            <span>⚖ Steady pace</span>
          )}
        </div>
      </div>
    </div>
  );
}
