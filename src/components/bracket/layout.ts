/**
 * @file src/components/bracket/layout.ts
 * @desc Pure layout for BracketView. The types mirror @haruhimemoe/tourney's Bracket structurally,
 *       so a lib bracket passes as is and ui takes no tourney dependency. bracketColumns makes one
 *       block per side (winners, losers, grand, third), one column per round in play order, and
 *       leaves qualifiers out.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Oct 8, 2026
 * @modified Thu Oct 8, 2026
 */

/** Where a side comes from: a seed, or the winner or loser of an earlier match. */
export type BracketSourceLike =
  | { kind: "seed"; seed: number }
  | { kind: "winner" | "loser"; match: string };

/** One side of a match: its source, its entrant once known, and whether it is known. */
export type BracketSideLike = {
  entrant: string | null;
  settled: boolean;
  source: BracketSourceLike;
};

/** One bracket match. */
export type BracketMatchLike = {
  code: string;
  round: string;
  a: BracketSideLike;
  b: BracketSideLike;
  status: string;
  scoreA: number | null;
  scoreB: number | null;
  winner: "a" | "b" | null;
};

/** Which part of the bracket a round belongs to. */
export type BracketRoundSide = "qualifiers" | "winners" | "losers" | "grand" | "third";

/** One round. `order` is play order. */
export type BracketRoundLike = {
  code: string;
  name: string;
  side: BracketRoundSide;
  order: number;
};

/** A bracket: its format, rounds and matches. */
export type BracketLike = {
  format: string;
  rounds: readonly BracketRoundLike[];
  matches: readonly BracketMatchLike[];
};

/** One column: a round and its matches in bracket order. */
export type BracketColumn = { code: string; name: string; matches: BracketMatchLike[] };

/** One block of columns. */
export type BracketBlock = {
  side: Exclude<BracketRoundSide, "qualifiers">;
  rounds: BracketColumn[];
};

const SIDES = ["winners", "losers", "grand", "third"] as const;

/**
 * @function bracketColumns
 * @param bracket {BracketLike} the bracket
 * @returns {BracketBlock[]} the non-empty blocks, winners first, each round a column
 */
export const bracketColumns = (bracket: BracketLike): BracketBlock[] => {
  const byRound = new Map<string, BracketMatchLike[]>();
  for (const m of bracket.matches) byRound.set(m.round, [...(byRound.get(m.round) ?? []), m]);
  const sorted = [...bracket.rounds].sort((x, y) => x.order - y.order);
  return SIDES.map((side) => ({
    side,
    rounds: sorted
      .filter((r) => r.side === side)
      .map((r) => ({ code: r.code, name: r.name, matches: byRound.get(r.code) ?? [] })),
  })).filter((block) => block.rounds.length > 0);
};

/**
 * @function sideLabel
 * @param source {BracketSourceLike} where a side comes from
 * @returns {string} "Seed 3", "Winner of M5" or "Loser of M2"
 */
export const sideLabel = (source: BracketSourceLike): string =>
  source.kind === "seed"
    ? `Seed ${source.seed}`
    : `${source.kind === "winner" ? "Winner" : "Loser"} of ${source.match}`;
