/** Parses a "YYYY-MM-DD" string as a local (not UTC) Date. Returns undefined for empty/invalid input. */
export function parseLocalDate(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

/** Formats a local Date as "YYYY-MM-DD". */
export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Formats a Date as "Mon-DD" or, when `withYear` is set, "Mon-DD-YYYY". */
export function formatDateLabel(date: Date, withYear: boolean) {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = String(date.getDate()).padStart(2, "0");
  return withYear ? `${month}-${day}-${date.getFullYear()}` : `${month}-${day}`;
}
