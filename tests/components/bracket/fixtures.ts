/**
 * @file tests/components/bracket/fixtures.ts
 * @desc Hand-built brackets shaped like @haruhimemoe/tourney's Bracket: 8 single elimination
 *       (with an optional third place), 16 double elimination with a reset, and a qualifiers round.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Oct 8, 2026
 * @modified Thu Oct 8, 2026
 */

import type {
  BracketLike,
  BracketMatchLike,
  BracketRoundLike,
} from "../../../src/components/bracket/layout.js";

const side = (seed: number): BracketMatchLike["a"] => ({
  entrant: null,
  settled: false,
  source: { kind: "seed", seed },
});

/** A match with seeded empty sides; override what the test needs. */
export const match = (
  code: string,
  round: string,
  over: Partial<BracketMatchLike> = {},
): BracketMatchLike => ({
  code,
  round,
  a: side(1),
  b: side(2),
  status: "pending",
  scoreA: null,
  scoreB: null,
  winner: null,
  ...over,
});

const rounds = (list: [string, BracketRoundLike["side"]][]): BracketRoundLike[] =>
  list.map(([code, s], order) => ({ code, name: code, side: s, order }));

/** 8 single elimination: QF (4), SF (2), F (1); `third` adds a third-place match. */
export const single8 = (third = false): BracketLike => ({
  format: "single",
  rounds: rounds([
    ["QF", "winners"],
    ["SF", "winners"],
    ...(third ? ([["3RD", "third"]] as [string, BracketRoundLike["side"]][]) : []),
    ["F", "winners"],
  ]),
  matches: [
    ...["M1", "M2", "M3", "M4"].map((c) => match(c, "QF")),
    match("M5", "SF"),
    match("M6", "SF"),
    ...(third ? [match("M7", "3RD")] : []),
    match(third ? "M8" : "M7", "F"),
  ],
});

/** 16 double elimination with a grand final reset. */
export const double16 = (): BracketLike => {
  const r = rounds([
    ["WR1", "winners"],
    ["WR2", "winners"],
    ["WSF", "winners"],
    ["WF", "winners"],
    ["LR1", "losers"],
    ["LR2", "losers"],
    ["LR3", "losers"],
    ["LR4", "losers"],
    ["LSF", "losers"],
    ["LF", "losers"],
    ["GF", "grand"],
    ["GF2", "grand"],
  ]);
  const sizes: Record<string, number> = {
    WR1: 8,
    WR2: 4,
    WSF: 2,
    WF: 1,
    LR1: 4,
    LR2: 4,
    LR3: 2,
    LR4: 2,
    LSF: 1,
    LF: 1,
    GF: 1,
    GF2: 1,
  };
  let n = 0;
  const matches = r.flatMap((round) =>
    Array.from({ length: sizes[round.code] ?? 0 }, () => match(`M${++n}`, round.code)),
  );
  return { format: "double", rounds: r, matches };
};
