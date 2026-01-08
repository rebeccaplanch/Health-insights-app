/**
 * Get today's date in YYYY-MM-DD format (client-side)
 * Uses the browser's local timezone
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string to a human-readable format
 * Example: "2024-09-10" -> "Tue Sep 10"
 */
export function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Convert Strava activity start_date_local to YYYY-MM-DD
 */
export function extractDateFromDateTime(dateTime: string): string {
  return dateTime.split('T')[0];
}
