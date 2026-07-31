/**
 * Time estimation utility for converting minutes to human-readable units (Minutes, Hours, Days, Weeks)
 * Standard JIRA time conversions:
 * 1 Minute = 1 min
 * 1 Hour = 60 mins
 * 1 Day = 8 hours = 480 mins
 * 1 Week = 5 days = 40 hours = 2,400 mins
 */

export type TimeUnit = "m" | "h" | "d" | "w";

export interface TimeEstimate {
  value: number | "";
  unit: TimeUnit;
}

export const TIME_UNIT_LABELS: Record<TimeUnit, string> = {
  m: "Mins",
  h: "Hours",
  d: "Days",
  w: "Weeks",
};

export const TIME_UNIT_MULTIPLIERS: Record<TimeUnit, number> = {
  m: 1,
  h: 60,
  d: 480, // 8h per working day
  w: 2400, // 5 days per working week
};

export function convertToMinutes(value: number | string | null | undefined, unit: TimeUnit): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * TIME_UNIT_MULTIPLIERS[unit]);
}

export function formatMinutesToEstimate(totalMinutes: number | null | undefined): TimeEstimate {
  if (totalMinutes === null || totalMinutes === undefined || totalMinutes < 0) {
    return { value: "", unit: "h" };
  }

  if (totalMinutes === 0) {
    return { value: 0, unit: "h" };
  }

  if (totalMinutes % TIME_UNIT_MULTIPLIERS.w === 0) {
    return { value: totalMinutes / TIME_UNIT_MULTIPLIERS.w, unit: "w" };
  }

  if (totalMinutes % TIME_UNIT_MULTIPLIERS.d === 0) {
    return { value: totalMinutes / TIME_UNIT_MULTIPLIERS.d, unit: "d" };
  }

  if (totalMinutes % TIME_UNIT_MULTIPLIERS.h === 0) {
    return { value: totalMinutes / TIME_UNIT_MULTIPLIERS.h, unit: "h" };
  }

  return { value: totalMinutes, unit: "m" };
}

export function displayFormattedTime(totalMinutes: number | null | undefined): string {
  if (totalMinutes === null || totalMinutes === undefined || totalMinutes < 0) return "None";
  if (totalMinutes === 0) return "0h";

  const weeks = Math.floor(totalMinutes / TIME_UNIT_MULTIPLIERS.w);
  let rem = totalMinutes % TIME_UNIT_MULTIPLIERS.w;

  const days = Math.floor(rem / TIME_UNIT_MULTIPLIERS.d);
  rem %= TIME_UNIT_MULTIPLIERS.d;

  const hours = Math.floor(rem / TIME_UNIT_MULTIPLIERS.h);
  const mins = rem % TIME_UNIT_MULTIPLIERS.h;

  const parts: string[] = [];
  if (weeks > 0) parts.push(`${weeks}w`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  return parts.join(" ");
}
