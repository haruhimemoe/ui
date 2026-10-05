/**
 * @file src/components/content/contentDate.ts
 * @desc Formats a content date (published, lastUpdated) for display: a real ISO day becomes
 *       "Oct 4, 2026" in UTC so every server and locale renders the same day; anything else,
 *       including an impossible day like "2026-02-30", prints as given.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

const FORMAT = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

/**
 * @function formatContentDate
 * @param value {string} a content date, usually YYYY-MM-DD
 * @returns {string} "Oct 4, 2026" for a real ISO day (formatted in UTC so every server and
 *          locale shows the same day); anything else, including impossible days, as given
 */
export function formatContentDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return value;
  return FORMAT.format(date);
}
