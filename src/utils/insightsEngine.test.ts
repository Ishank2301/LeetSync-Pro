import test from "node:test";
import assert from "node:assert/strict";
import {
  computeConsistencyScore,
  computeProductivityInsights,
  formatHourLabel,
  getTimeBlockForHour,
} from "./insightsEngine";
import { SubmissionItem } from "../types";

test("formatHourLabel formats 24h hours to 12h representation accurately", () => {
  assert.equal(formatHourLabel(0), "12 AM");
  assert.equal(formatHourLabel(9), "9 AM");
  assert.equal(formatHourLabel(12), "12 PM");
  assert.equal(formatHourLabel(13), "1 PM");
  assert.equal(formatHourLabel(23), "11 PM");
});

test("getTimeBlockForHour maps hours to correct circadian blocks", () => {
  assert.equal(getTimeBlockForHour(6), "Early Morning (5 AM - 9 AM)");
  assert.equal(getTimeBlockForHour(10), "Morning Focus (9 AM - 12 PM)");
  assert.equal(getTimeBlockForHour(14), "Afternoon Flow (12 PM - 5 PM)");
  assert.equal(getTimeBlockForHour(19), "Evening Grind (5 PM - 9 PM)");
  assert.equal(getTimeBlockForHour(23), "Night Owl (9 PM - 5 AM)");
  assert.equal(getTimeBlockForHour(2), "Night Owl (9 PM - 5 AM)");
});

test("computeConsistencyScore scales properly with active days and streaks", () => {
  const ref = new Date("2026-10-31T12:00:00Z");

  // High consistency: 18 active days in past 30 days, streak of 5
  const activeDaily: Record<string, number> = {};
  for (let i = 0; i < 20; i++) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    activeDaily[d.toISOString().split("T")[0]] = 1;
  }

  const highScore = computeConsistencyScore(activeDaily, 5, 10, ref);
  assert.ok(highScore.totalScore >= 80, `Expected >= 80, got ${highScore.totalScore}`);
  assert.equal(highScore.activeDays30d, 20);
  assert.ok(["S", "A+", "A"].includes(highScore.grade));

  // Low consistency: 1 active day in past 30 days
  const lowDaily = { "2026-10-31": 1 };
  const lowScore = computeConsistencyScore(lowDaily, 0, 1, ref);
  assert.ok(lowScore.totalScore < 50, `Expected < 50, got ${lowScore.totalScore}`);
});

test("computeProductivityInsights discovers peak productivity hour and suggests window", () => {
  const ref = new Date("2026-10-31T12:00:00Z");

  // Submissions predominantly at 13:00 (1 PM) and 14:00 (2 PM)
  const submissions: SubmissionItem[] = [
    {
      id: "1",
      title: "Problem 1",
      difficulty: "Easy",
      category: "Arrays",
      language: "python3",
      github_url: "https://github.com",
      synced_at: "2026-10-30T13:15:00Z",
    },
    {
      id: "2",
      title: "Problem 2",
      difficulty: "Medium",
      category: "DP",
      language: "cpp",
      github_url: "https://github.com",
      synced_at: "2026-10-29T13:45:00Z",
    },
    {
      id: "3",
      title: "Problem 3",
      difficulty: "Hard",
      category: "Graph",
      language: "python3",
      github_url: "https://github.com",
      synced_at: "2026-10-28T14:10:00Z",
    },
    {
      id: "4",
      title: "Problem 4",
      difficulty: "Medium",
      category: "Trees",
      language: "python3",
      github_url: "https://github.com",
      synced_at: "2026-10-26T13:30:00Z",
    },
  ];

  const insights = computeProductivityInsights(
    submissions,
    { "2026-10-30": 1, "2026-10-29": 1, "2026-10-28": 1, "2026-10-26": 1 },
    3,
    5,
    ref
  );

  assert.equal(insights.totalSubmissionsAnalyzed, 4);
  assert.ok(insights.peakHour.label.length > 0);
  assert.ok(insights.recommendation.includes("submissions logged"));
  assert.ok(insights.timeBlocks.length === 5);
  assert.ok(insights.hourlyDistribution.length === 24);
  assert.ok(insights.daysOfWeek.length === 7);
});
