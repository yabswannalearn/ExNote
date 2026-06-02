// SQLite CURRENT_TIMESTAMP is stored as UTC "YYYY-MM-DD HH:MM:SS". Parse it as
// UTC, then format in the device's locale/timezone.
function parseSqliteUtc(timestamp: string): Date {
  return new Date(timestamp.replace(' ', 'T') + 'Z');
}

export function formatSessionDate(timestamp: string): string {
  return parseSqliteUtc(timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatSessionTime(timestamp: string): string {
  return parseSqliteUtc(timestamp).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
