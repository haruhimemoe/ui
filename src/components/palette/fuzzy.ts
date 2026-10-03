/**
 * @file src/components/palette/fuzzy.ts
 * @desc The palette's scorer, pure. A query matches a text when its characters appear in order
 *       (case-insensitive). Each matched character scores 10 at a word start, 8 when it follows
 *       the previous match, 4 otherwise, minus one per skipped character; a query that prefixes
 *       the text adds 20. A command's score is the best of its title, keywords (0.7), subtitle
 *       (0.5) and group (0.3). A letter or digit may only match at a word start or right after
 *       the previous match, so "cpu" lands on "Copy page URL"'s initials and "go" never finds
 *       "Sign out"; punctuation may match anywhere. Backtracking, left to right.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { Command } from "./types.js";

/** A match: its score and the matched [start, end) spans in the text, for highlighting. */
export type FuzzyMatch = { score: number; ranges: readonly (readonly [number, number])[] };

/** A command with its score and the title's matched spans (empty when another field matched). */
export type Scored = { command: Command; score: number; ranges: FuzzyMatch["ranges"] };

const WORD_BREAK = /[\s\-_/.]/;

const isWordStart = (text: string, at: number): boolean => {
  if (at === 0) return true;
  const before = text[at - 1] ?? "";
  const here = text[at] ?? "";
  if (WORD_BREAK.test(before)) return true;
  return before === before.toLowerCase() && here !== here.toLowerCase();
};

const ALNUM = /[\p{L}\p{N}]/u;

/**
 * The positions where the query's characters match, found left to right with backtracking.
 * A letter or digit may only match at a word start or right after the previous match (so "go"
 * never lands on the g inside "Sign out"); punctuation may match anywhere. Null when the
 * query can't be placed.
 */
const place = (
  chars: readonly string[],
  i: number,
  from: number,
  prev: number,
  text: string,
  t: string,
): number[] | null => {
  const ch = chars[i];
  if (ch === undefined) return [];
  for (let at = t.indexOf(ch, from); at >= 0; at = t.indexOf(ch, at + 1)) {
    const allowed = !ALNUM.test(ch) || (prev >= 0 && at === prev + 1) || isWordStart(text, at);
    if (!allowed) continue;
    const rest = place(chars, i + 1, at + 1, at, text, t);
    if (rest) return [at, ...rest];
  }
  return null;
};

/**
 * @function fuzzyScore
 * @param query {string} what was typed; surrounding spaces are ignored
 * @param text {string} a title, keyword or heading
 * @returns {FuzzyMatch | null} the score and matched spans, or null when the query isn't a
 *          subsequence of the text. An empty query scores 0 with no spans.
 */
export function fuzzyScore(query: string, text: string): FuzzyMatch | null {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return { score: 0, ranges: [] };
  const t = text.toLowerCase();
  const positions = place([...q], 0, 0, -1, text, t);
  if (!positions) return null;
  let score = 0;
  let prev = -1;
  const ranges: [number, number][] = [];
  for (const at of positions) {
    if (prev >= 0 && at === prev + 1) score += 8;
    else if (isWordStart(text, at)) score += 10;
    else score += 4;
    if (prev >= 0) score -= Math.max(0, at - prev - 1);
    const last = ranges[ranges.length - 1];
    if (last && last[1] === at) last[1] = at + 1;
    else ranges.push([at, at + 1]);
    prev = at;
  }
  if (t.startsWith(q)) score += 20;
  return { score, ranges };
}

const WEIGHTS = { keyword: 0.7, subtitle: 0.5, group: 0.3 } as const;

/**
 * @function scoreCommand
 * @param query {string} what was typed
 * @param command {Command} a row
 * @returns {Scored | null} the best weighted field match, with title spans only when the title
 *          itself matched; null when no field matches
 */
export function scoreCommand(query: string, command: Command): Scored | null {
  const title = fuzzyScore(query, command.title);
  let best = title ? { score: title.score, ranges: title.ranges } : null;
  const consider = (text: string | undefined, weight: number) => {
    if (!text) return;
    const match = fuzzyScore(query, text);
    if (match && (!best || match.score * weight > best.score)) {
      best = { score: match.score * weight, ranges: [] };
    }
  };
  for (const keyword of command.keywords ?? []) consider(keyword, WEIGHTS.keyword);
  consider(command.subtitle, WEIGHTS.subtitle);
  consider(command.group, WEIGHTS.group);
  return best ? { command, ...best } : null;
}

/**
 * @function rankResults
 * @param query {string} what was typed
 * @param commands {readonly Command[]} the rows to search
 * @param boost {(id: string) => number} a tie-breaker per id (recents count)
 * @returns {Scored[]} the matching rows, best first; ties go to the higher boost, then to
 *          declaration order
 */
export function rankResults(
  query: string,
  commands: readonly Command[],
  boost: (id: string) => number,
): Scored[] {
  return commands
    .map((command, index) => ({ scored: scoreCommand(query, command), index }))
    .filter((entry): entry is { scored: Scored; index: number } => entry.scored !== null)
    .sort(
      (a, b) =>
        b.scored.score - a.scored.score ||
        boost(b.scored.command.id) - boost(a.scored.command.id) ||
        a.index - b.index,
    )
    .map((entry) => entry.scored);
}
