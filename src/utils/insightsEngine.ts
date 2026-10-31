import { SubmissionItem } from "../types";

export type TimeBlockName =
  | "Early Morning (5 AM - 9 AM)"
  | "Morning Focus (9 AM - 12 PM)"
  | "Afternoon Flow (12 PM - 5 PM)"
  | "Evening Grind (5 PM - 9 PM)"
  | "Night Owl (9 PM - 5 AM)";

export interface TimeBlockStats {
  name: TimeBlockName;
  shortName: string;
  range: string;
  count: number;
  percentage: number;
  icon: string;
}

export interface HourlyDistributionItem {
  hour: number;
  label: string; // e.g. "1 PM", "2 PM"
  count: number;
  isPeak: boolean;
}

export interface DayOfWeekStats {
  dayName: string; // "Mon", "Tue", etc.
  dayIndex: number; // 0 = Sun, 1 = Mon ...
  count: number;
  percentage: number;
  isBestDay: boolean;
}

export interface ConsistencyScoreBreakdown {
  coverageScore: number; // Max 40
  streakScore: number; // Max 30
  regularityScore: number; // Max 20
  momentumScore: number; // Max 10
  totalScore: number; // 0 to 100
  grade: "S" | "A+" | "A" | "B" | "C" | "D";
  statusTitle: string;
  summary: string;
  activeDays30d: number;
  totalDaysEvaluated: number;
}

export interface ProductivityInsights {
  consistency: ConsistencyScoreBreakdown;
  peakHour: {
    hour: number;
    label: string; // e.g. "1:00 PM - 2:00 PM"
    count: number;
  };
  peakTimeBlock: TimeBlockStats;
  timeBlocks: TimeBlockStats[];
  hourlyDistribution: HourlyDistributionItem[];
  daysOfWeek: DayOfWeekStats[];
  bestDay: DayOfWeekStats;
  personaTitle: string;
  recommendation: string;
  totalSubmissionsAnalyzed: number;
}

/**
 * Maps hour (0-23) to 12-hour formatted label
 */
export function formatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

/**
 * Determines which time block an hour belongs to
 */
export function getTimeBlockForHour(hour: number): TimeBlockName {
  if (hour >= 5 && hour < 9) return "Early Morning (5 AM - 9 AM)";
  if (hour >= 9 && hour < 12) return "Morning Focus (9 AM - 12 PM)";
  if (hour >= 12 && hour < 17) return "Afternoon Flow (12 PM - 5 PM)";
  if (hour >= 17 && hour < 21) return "Evening Grind (5 PM - 9 PM)";
  return "Night Owl (9 PM - 5 AM)";
}

/**
 * Calculates Consistency Score based on:
 * - Active days in past 30 days (40%)
 * - Current and max streak consistency (30%)
 * - Day-to-day distribution stability vs extreme volatility (20%)
 * - Recent 7-day velocity momentum (10%)
 */
export function computeConsistencyScore(
  dailyActivity: Record<string, number>,
  currentStreak: number,
  longestStreak: number,
  refDate: Date = new Date()
): ConsistencyScoreBreakdown {
  const windowDays = 30;
  let activeDays30d = 0;
  const counts: number[] = [];

  let last7DaysCount = 0;
  let prev7DaysCount = 0;

  for (let i = 0; i < windowDays; i++) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const c = dailyActivity[key] || 0;
    counts.push(c);
    if (c > 0) activeDays30d++;

    if (i < 7) {
      last7DaysCount += c;
    } else if (i < 14) {
      prev7DaysCount += c;
    }
  }

  // 1. Coverage Score (max 40 pts) - Target: 18+ active days out of 30 = full points
  const coverageRatio = Math.min(1, activeDays30d / 18);
  const coverageScore = Math.round(coverageRatio * 40);

  // 2. Streak Score (max 30 pts)
  // 5-day current streak gives 15 pts, 10-day longest streak gives 15 pts
  const curStreakRatio = Math.min(1, currentStreak / 5);
  const maxStreakRatio = Math.min(1, longestStreak / 10);
  const streakScore = Math.round(curStreakRatio * 15 + maxStreakRatio * 15);

  // 3. Regularity Score (max 20 pts)
  // Reward consistent 1-3 problems/day over zero activity or 1-day bursts
  let regularityScore = 0;
  if (activeDays30d > 0) {
    const activeCounts = counts.filter((c) => c > 0);
    const mean = activeCounts.reduce((a, b) => a + b, 0) / activeCounts.length;
    const variance =
      activeCounts.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) /
      activeCounts.length;
    const stdDev = Math.sqrt(variance);

    // If stdDev is low (e.g. consistently 1-2 problems), award higher score
    if (stdDev <= 1.0) {
      regularityScore = 20;
    } else if (stdDev <= 2.0) {
      regularityScore = 15;
    } else {
      regularityScore = 10;
    }
  }

  // 4. Momentum Score (max 10 pts)
  let momentumScore = 5;
  if (last7DaysCount > prev7DaysCount) {
    momentumScore = 10;
  } else if (last7DaysCount === prev7DaysCount && last7DaysCount > 0) {
    momentumScore = 8;
  } else if (last7DaysCount === 0 && prev7DaysCount > 0) {
    momentumScore = 2;
  }

  const totalScore = Math.min(
    100,
    Math.max(0, coverageScore + streakScore + regularityScore + momentumScore)
  );

  let grade: ConsistencyScoreBreakdown["grade"] = "C";
  let statusTitle = "Developing Rhythm";
  let summary =
    "Focus on solving at least 1 problem every other day to cultivate strong algorithmic recall.";

  if (totalScore >= 92) {
    grade = "S";
    statusTitle = "Elite Consistency";
    summary =
      "Exceptional daily momentum! Your persistent schedule maximizes long-term problem retention.";
  } else if (totalScore >= 82) {
    grade = "A+";
    statusTitle = "High Momentum";
    summary =
      "Strong habit formation. You maintain consistent practice with minimal gaps between sessions.";
  } else if (totalScore >= 70) {
    grade = "A";
    statusTitle = "Steady Cadence";
    summary =
      "Great regular practice. Sustaining your current pace will build strong interview readiness.";
  } else if (totalScore >= 55) {
    grade = "B";
    statusTitle = "Moderate Rhythm";
    summary =
      "Good progress! Try tightening the gap between active days to avoid losing momentum.";
  } else if (totalScore >= 35) {
    grade = "C";
    statusTitle = "Intermittent Solver";
    summary =
      "Active in spurts. Setting a predictable daily 20-minute practice slot will double your retention.";
  } else {
    grade = "D";
    statusTitle = "Starting Out";
    summary =
      "Begin with 1 easy problem per day to start filling in your streak and consistency rating.";
  }

  return {
    coverageScore,
    streakScore,
    regularityScore,
    momentumScore,
    totalScore,
    grade,
    statusTitle,
    summary,
    activeDays30d,
    totalDaysEvaluated: windowDays,
  };
}

/**
 * Calculates hourly and time-block breakdown to discover peak productivity time
 */
export function computeProductivityInsights(
  submissions: SubmissionItem[],
  dailyActivity: Record<string, number>,
  currentStreak: number,
  longestStreak: number,
  refDate: Date = new Date()
): ProductivityInsights {
  const consistency = computeConsistencyScore(
    dailyActivity,
    currentStreak,
    longestStreak,
    refDate
  );

  // Initialize 24-hour distribution
  const hourCounts: number[] = new Array(24).fill(0);
  const dayOfWeekCounts: number[] = new Array(7).fill(0); // 0 = Sun

  const blockCounts: Record<TimeBlockName, number> = {
    "Early Morning (5 AM - 9 AM)": 0,
    "Morning Focus (9 AM - 12 PM)": 0,
    "Afternoon Flow (12 PM - 5 PM)": 0,
    "Evening Grind (5 PM - 9 PM)": 0,
    "Night Owl (9 PM - 5 AM)": 0,
  };

  submissions.forEach((item) => {
    if (!item.synced_at) return;
    const date = new Date(item.synced_at);
    if (isNaN(date.getTime())) return;

    const hour = date.getHours();
    const day = date.getDay();

    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    dayOfWeekCounts[day] = (dayOfWeekCounts[day] || 0) + 1;

    const block = getTimeBlockForHour(hour);
    blockCounts[block] = (blockCounts[block] || 0) + 1;
  });

  const totalAnalyzed = submissions.length;

  // Find Peak Hour
  let peakHourIdx = 13; // default 1 PM
  let maxHourCount = 0;
  for (let h = 0; h < 24; h++) {
    if (hourCounts[h] > maxHourCount) {
      maxHourCount = hourCounts[h];
      peakHourIdx = h;
    }
  }

  const hourlyDistribution: HourlyDistributionItem[] = hourCounts.map(
    (count, hour) => ({
      hour,
      label: formatHourLabel(hour),
      count,
      isPeak: count > 0 && hour === peakHourIdx,
    })
  );

  // Time Blocks breakdown
  const blockConfigs: Array<{
    name: TimeBlockName;
    shortName: string;
    range: string;
    icon: string;
  }> = [
    {
      name: "Early Morning (5 AM - 9 AM)",
      shortName: "Early Morning",
      range: "5:00 AM – 9:00 AM",
      icon: "🌅",
    },
    {
      name: "Morning Focus (9 AM - 12 PM)",
      shortName: "Morning Focus",
      range: "9:00 AM – 12:00 PM",
      icon: "☕",
    },
    {
      name: "Afternoon Flow (12 PM - 5 PM)",
      shortName: "Afternoon Flow",
      range: "12:00 PM – 5:00 PM",
      icon: "⚡",
    },
    {
      name: "Evening Grind (5 PM - 9 PM)",
      shortName: "Evening Grind",
      range: "5:00 PM – 9:00 PM",
      icon: "🌆",
    },
    {
      name: "Night Owl (9 PM - 5 AM)",
      shortName: "Night Owl",
      range: "9:00 PM – 5:00 AM",
      icon: "🌙",
    },
  ];

  let topBlockName: TimeBlockName = "Afternoon Flow (12 PM - 5 PM)";
  let maxBlockCount = -1;

  const timeBlocks: TimeBlockStats[] = blockConfigs.map((cfg) => {
    const count = blockCounts[cfg.name] || 0;
    const percentage =
      totalAnalyzed > 0 ? Math.round((count / totalAnalyzed) * 100) : 0;
    if (count > maxBlockCount) {
      maxBlockCount = count;
      topBlockName = cfg.name;
    }
    return {
      name: cfg.name,
      shortName: cfg.shortName,
      range: cfg.range,
      count,
      percentage,
      icon: cfg.icon,
    };
  });

  const peakTimeBlock =
    timeBlocks.find((b) => b.name === topBlockName) || timeBlocks[2];

  // Best Day of Week
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  let bestDayIdx = 3; // Wednesday fallback
  let maxDayCount = -1;

  const daysOfWeek: DayOfWeekStats[] = dayNames.map((name, idx) => {
    const count = dayOfWeekCounts[idx] || 0;
    const percentage =
      totalAnalyzed > 0 ? Math.round((count / totalAnalyzed) * 100) : 0;
    if (count > maxDayCount) {
      maxDayCount = count;
      bestDayIdx = idx;
    }
    return {
      dayName: name,
      dayIndex: idx,
      count,
      percentage,
      isBestDay: false,
    };
  });

  daysOfWeek[bestDayIdx].isBestDay = true;
  const bestDay = daysOfWeek[bestDayIdx];

  // Derive Persona & Actionable Recommendation
  let personaTitle = "Afternoon Momentum Builder";
  if (peakTimeBlock.shortName === "Night Owl") {
    personaTitle = "Late-Night Deep Focus Solver";
  } else if (peakTimeBlock.shortName === "Morning Focus") {
    personaTitle = "Morning Routine Optimizer";
  } else if (peakTimeBlock.shortName === "Early Morning") {
    personaTitle = "Early-Bird Algorithm Hunter";
  } else if (peakTimeBlock.shortName === "Evening Grind") {
    personaTitle = "Evening Post-Work Sprinter";
  }

  const peakHourStr = formatHourLabel(peakHourIdx);
  const nextHourStr = formatHourLabel((peakHourIdx + 1) % 24);

  const recommendation =
    totalAnalyzed > 0
      ? `Your highest problem-solving output occurs around ${peakHourStr} (${peakHourStr} – ${nextHourStr}), with ${peakTimeBlock.percentage}% of your code submissions logged during ${peakTimeBlock.shortName}. Schedule challenging Hard/Medium problems during ${peakTimeBlock.range} for peak focus.`
      : "Log a few problem submissions to unlock your personalized peak productivity window and circadian solving curve.";

  return {
    consistency,
    peakHour: {
      hour: peakHourIdx,
      label: `${peakHourStr} – ${nextHourStr}`,
      count: maxHourCount,
    },
    peakTimeBlock,
    timeBlocks,
    hourlyDistribution,
    daysOfWeek,
    bestDay,
    personaTitle,
    recommendation,
    totalSubmissionsAnalyzed: totalAnalyzed,
  };
}
