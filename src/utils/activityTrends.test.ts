import test from "node:test";
import assert from "node:assert/strict";
import {
  computeMovingAverageData,
  computeTrendSummary,
  formatDateKey,
} from "./activityTrends";

test("computeMovingAverageData handles empty activity correctly", () => {
  const ref = new Date("2026-10-30T00:00:00Z");
  const data = computeMovingAverageData({}, 14, ref);

  assert.equal(data.length, 14);
  for (const point of data) {
    assert.equal(point.count, 0);
    assert.equal(point.movingAvg7d, 0);
  }
});

test("computeMovingAverageData calculates 7-day rolling average correctly", () => {
  const ref = new Date("2026-10-30T00:00:00Z");
  const activity: Record<string, number> = {};

  // Give 7 consecutive days 1 solve each
  for (let i = 0; i < 7; i++) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    activity[formatDateKey(d)] = 1;
  }

  const data = computeMovingAverageData(activity, 7, ref);
  assert.equal(data.length, 7);

  // The last day has all 7 days of 1 solve, so moving average = 7 / 7 = 1.00
  const lastPoint = data[data.length - 1];
  assert.equal(lastPoint.movingAvg7d, 1);
  assert.equal(lastPoint.count, 1);
});

test("computeTrendSummary detects positive momentum vs previous 7-day window", () => {
  const ref = new Date("2026-10-30T00:00:00Z");
  const activity: Record<string, number> = {};

  // Previous 7-day window (days 7 to 13 ago): 1 solve every other day = 3 solves
  // Current 7-day window (days 0 to 6 ago): 2 solves each day = 14 solves
  for (let i = 0; i < 7; i++) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    activity[formatDateKey(d)] = 2;
  }
  for (let i = 7; i < 14; i += 2) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    activity[formatDateKey(d)] = 1;
  }

  const data = computeMovingAverageData(activity, 14, ref);
  const summary = computeTrendSummary(data);

  assert.equal(summary.current7dTotal, 14);
  assert.equal(summary.current7dAvg, 2);
  assert.equal(summary.previous7dTotal, 4);
  assert.equal(summary.trendDirection, "up");
  assert.ok(summary.percentChange > 0);
});

test("computeTrendSummary handles flat and zero activity gracefully", () => {
  const ref = new Date("2026-10-30T00:00:00Z");
  const data = computeMovingAverageData({}, 14, ref);
  const summary = computeTrendSummary(data);

  assert.equal(summary.current7dAvg, 0);
  assert.equal(summary.previous7dAvg, 0);
  assert.equal(summary.percentChange, 0);
  assert.equal(summary.trendDirection, "flat");
});
