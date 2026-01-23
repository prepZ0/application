/**
 * Date utility functions
 */

/**
 * Format duration in minutes to human readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.abs(Math.floor(diffMs / 1000));
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isPast = diffMs < 0;
  const suffix = isPast ? "ago" : "";
  const prefix = isPast ? "" : "in ";

  if (diffDays > 0) {
    return `${prefix}${diffDays} day${diffDays > 1 ? "s" : ""} ${suffix}`.trim();
  }
  if (diffHours > 0) {
    return `${prefix}${diffHours} hour${diffHours > 1 ? "s" : ""} ${suffix}`.trim();
  }
  if (diffMinutes > 0) {
    return `${prefix}${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ${suffix}`.trim();
  }
  return "just now";
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Check if current time is within a date range
 */
export function isWithinRange(start: Date, end: Date): boolean {
  const now = Date.now();
  return start.getTime() <= now && now <= end.getTime();
}

/**
 * Add minutes to a date
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
