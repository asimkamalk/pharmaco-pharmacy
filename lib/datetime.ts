/** Pakistan Standard Time — business day starts at 12:00 AM (midnight). */
export const PK_TIMEZONE = "Asia/Karachi";
export const PK_UTC_OFFSET = "+05:00";

/** Calendar date key `YYYY-MM-DD` in Pakistan time. */
export function toPkDateKey(date: Date | string = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export function startOfPkDayFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00${PK_UTC_OFFSET}`);
}

export function endOfPkDayFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T23:59:59.999${PK_UTC_OFFSET}`);
}

export function startOfPkDay(date: Date | string = new Date()): Date {
  return startOfPkDayFromKey(toPkDateKey(date));
}

export function endOfPkDay(date: Date | string = new Date()): Date {
  return endOfPkDayFromKey(toPkDateKey(date));
}

/** Shift a Pakistan calendar date by whole days. */
export function shiftPkDateKey(dateKey: string, deltaDays: number): string {
  const noon = new Date(`${dateKey}T12:00:00${PK_UTC_OFFSET}`);
  noon.setTime(noon.getTime() + deltaDays * 24 * 60 * 60 * 1000);
  return toPkDateKey(noon);
}

export function formatPkDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: PK_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatPkDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-PK", {
    timeZone: PK_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatPkChartTick(
  dateKey: string,
  options?: { monthYear?: boolean },
): string {
  const date = startOfPkDayFromKey(dateKey);
  if (options?.monthYear) {
    return new Intl.DateTimeFormat("en-PK", {
      timeZone: PK_TIMEZONE,
      month: "short",
      year: "2-digit",
    }).format(date);
  }
  return dateKey.slice(5);
}

/** Hour of day 0–23 in Pakistan time. */
export function toPkHour(date: Date | string = new Date()): number {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: PK_TIMEZONE,
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date(date)),
  );
  return Number.isFinite(hour) ? hour : 0;
}

/** Chart / axis label for a Pakistan hour (`0`–`23` or `"00"`–`"23"`). */
export function formatPkHourLabel(hour: number | string): string {
  const h = typeof hour === "string" ? Number(hour) : hour;
  if (!Number.isFinite(h)) return String(hour);
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

export function pkHourKey(hour: number): string {
  return String(Math.max(0, Math.min(23, hour))).padStart(2, "0");
}
