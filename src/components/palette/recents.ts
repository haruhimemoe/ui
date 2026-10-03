/**
 * @file src/components/palette/recents.ts
 * @desc Which commands get used, in localStorage under "haruhime:palette:<key>": run count and
 *       last-use time per command id, pruned to the 50 most recent. Every read and write is
 *       guarded, so a blocked or full store means no recents, never an error.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

/** Per command id: how many runs and when the last one was (ms since epoch). */
export type Recents = Record<string, { n: number; t: number }>;

const LIMIT = 50;

/**
 * @function storageKeyFor
 * @param key {string} the app's namespace (CommandPalette's `storageKey`)
 * @returns {string} the localStorage key
 */
export const storageKeyFor = (key: string): string => `haruhime:palette:${key}`;

const isEntry = (value: unknown): value is { n: number; t: number } =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { n?: unknown }).n === "number" &&
  typeof (value as { t?: unknown }).t === "number";

/**
 * @function readRecents
 * @param key {string} the app's namespace
 * @returns {Recents} the stored recents, dropping entries that aren't `{ n, t }`; empty when
 *          storage is missing, throws, or holds something that isn't JSON
 */
export function readRecents(key: string): Recents {
  try {
    const raw = localStorage.getItem(storageKeyFor(key));
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => isEntry(value)));
  } catch {
    return {};
  }
}

/**
 * @function recordRecent
 * @param key {string} the app's namespace
 * @param id {string} the command that ran
 * @param now {number} the time, default Date.now()
 * @returns {Recents} the recents after the write (empty when storage is unavailable)
 */
export function recordRecent(key: string, id: string, now: number = Date.now()): Recents {
  // Storage that can't be read is treated as absent: nothing is written over it either.
  try {
    localStorage.getItem(storageKeyFor(key));
  } catch {
    return {};
  }
  const recents = readRecents(key);
  const entry = recents[id];
  recents[id] = { n: (entry?.n ?? 0) + 1, t: now };
  const kept = Object.fromEntries(
    Object.entries(recents)
      .sort(([, a], [, b]) => b.t - a.t)
      .slice(0, LIMIT),
  );
  try {
    localStorage.setItem(storageKeyFor(key), JSON.stringify(kept));
    return kept;
  } catch {
    return {};
  }
}

/**
 * @function recentIds
 * @param recents {Recents} the stored recents
 * @param limit {number} how many, default 5
 * @returns {string[]} ids by last use, newest first
 */
export const recentIds = (recents: Recents, limit = 5): string[] =>
  Object.entries(recents)
    .sort(([, a], [, b]) => b.t - a.t)
    .slice(0, limit)
    .map(([id]) => id);

/**
 * @function boostFrom
 * @param recents {Recents} the stored recents
 * @returns {(id: string) => number} the run count per id, 0 for unknown ids (rankResults' boost)
 */
export const boostFrom =
  (recents: Recents) =>
  (id: string): number =>
    recents[id]?.n ?? 0;
