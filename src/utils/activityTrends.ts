export interface DailyTrendPoint {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Oct 24"
  count: number; // daily solves
  movingAvg7d: number; // 7-day rolling average (problems/day)
}

export interface TrendSummary {
  current7dAvg: number;
  previous7dAvg: number;
  current7dTotal: number;
  previous7dTotal: number;
  percentChange: number; // percentage change vs previous 7-day window
  trendDirection: "up" | "down" | "flat";
  peakDailyCount: number;
  peakDateLabel: string;
  activeDaysInWindow: number;
  totalDaysInWindow: number;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Computes daily solve counts and a 7-day moving average over a specified number of days.
 * @param dailyActivity Map of date 'YYYY-MM-DD' -> solve count
 * @param daysCount Number of days in the returned series (e.g. 14, 30, 60)
 * @param referenceDate Optional reference end date (defaults to today)
 */
export function computeMovingAverageData(
  dailyActivity: Record<string, number> = {},
  daysCount = 30,
  referenceDate?: Date
): DailyTrendPoint[] {
  const end = referenceDate ? new Date(referenceDate) : new Date();
  end.setHours(0, 0, 0, 0);

  // We need an extra 6 days prior to the start of the window so that day 0 of the window
  // has a true 7-day moving average calculation.
  const totalDaysNeeded = daysCount + 6;
  const start = new Date(end);
  start.setDate(start.getDate() - (totalDaysNeeded - 1));

  // Build sequential list of all needed calendar dates
  const fullSeq: { dateStr: string; label: string; count: number }[] = [];
  const curr = new Date(start);
  while (curr <= end) {
    const dateStr = formatDateKey(curr);
    const count = dailyActivity[dateStr] || 0;
    fullSeq.push({
      dateStr,
      label: formatDateLabel(curr),
      count,
    });
    curr.setDate(curr.getDate() + 1);
  }

  // Calculate moving average for each day from index 6 to the end
  const result: DailyTrendPoint[] = [];
  for (let i = 6; i < fullSeq.length; i++) {
    let windowSum = 0;
    for (let j = i - 6; j <= i; j++) {
      windowSum += fullSeq[j].count;
    }
    const avg = Math.round((windowSum / 7) * 100) / 100;

    result.push({
      date: fullSeq[i].dateStr,
      label: fullSeq[i].label,
      count: fullSeq[i].count,
      movingAvg7d: avg,
    });
  }

  // Slice to guarantee exactly daysCount items
  return result.slice(result.length - daysCount);
}

/**
 * Summarizes the productivity trend by comparing the most recent 7-day window
 * with the immediately preceding 7-day window.
 */
export function computeTrendSummary(trendData: DailyTrendPoint[]): TrendSummary {
  if (!trendData || trendData.length === 0) {
    return {
      current7dAvg: 0,
      previous7dAvg: 0,
      current7dTotal: 0,
      previous7dTotal: 0,
      percentChange: 0,
      trendDirection: "flat",
      peakDailyCount: 0,
      peakDateLabel: "—",
      activeDaysInWindow: 0,
      totalDaysInWindow: 0,
    };
  }

  const n = trendData.length;
  // Current 7-day window: last 7 points
  const currentWindow = trendData.slice(Math.max(0, n - 7));
  // Previous 7-day window: the 7 points before that
  const previousWindow = trendData.slice(Math.max(0, n - 14), Math.max(0, n - 7));

  const current7dTotal = currentWindow.reduce((acc, p) => acc + p.count, 0);
  const previous7dTotal = previousWindow.reduce((acc, p) => acc + p.count, 0);

  const current7dAvg = currentWindow.length > 0
    ? Math.round((current7dTotal / currentWindow.length) * 100) / 100
    : 0;

  const previous7dAvg = previousWindow.length > 0
    ? Math.round((previous7dTotal / previousWindow.length) * 100) / 100
    : 0;

  let percentChange = 0;
  if (previous7dTotal > 0) {
    percentChange = Math.round(((current7dTotal - previous7dTotal) / previous7dTotal) * 100);
  } else if (current7dTotal > 0) {
    percentChange = 100;
  }

  let trendDirection: "up" | "down" | "flat" = "flat";
  if (percentChange > 0) trendDirection = "up";
  else if (percentChange < 0) trendDirection = "down";

  // Peak activity day
  let peakDailyCount = 0;
  let peakDateLabel = trendData[0]?.label || "—";
  let activeDaysInWindow = 0;

  for (const point of trendData) {
    if (point.count > 0) activeDaysInWindow++;
    if (point.count > peakDailyCount) {
      peakDailyCount = point.count;
      peakDateLabel = point.label;
    }
  }

  return {
    current7dAvg,
    previous7dAvg,
    current7dTotal,
    previous7dTotal,
    percentChange,
    trendDirection,
    peakDailyCount,
    peakDateLabel,
    activeDaysInWindow,
    totalDaysInWindow: trendData.length,
  };
}
