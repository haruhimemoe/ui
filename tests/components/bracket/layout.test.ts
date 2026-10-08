/**
 * @file tests/components/bracket/layout.test.ts
 * @desc bracketColumns: one block per side in winners, losers, grand, third order, one column per
 *       round in play order, qualifiers left out, matches kept in bracket order.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Oct 8, 2026
 * @modified Thu Oct 8, 2026
 */

import { describe, expect, it } from "vitest";
import { bracketColumns, sideLabel } from "../../../src/components/bracket/layout.js";
import { double16, match, single8 } from "./fixtures.js";

describe("bracketColumns", () => {
  it("gives 8 single elimination three winners columns", () => {
    const blocks = bracketColumns(single8());
    expect(blocks.map((b) => b.side)).toEqual(["winners"]);
    expect(blocks[0]?.rounds.map((r) => [r.code, r.matches.length])).toEqual([
      ["QF", 4],
      ["SF", 2],
      ["F", 1],
    ]);
  });

  it("gives 16 double with a reset winners, losers and grand blocks", () => {
    const blocks = bracketColumns(double16());
    expect(blocks.map((b) => b.side)).toEqual(["winners", "losers", "grand"]);
    expect(blocks[0]?.rounds).toHaveLength(4);
    expect(blocks[1]?.rounds).toHaveLength(6);
    expect(blocks[2]?.rounds.map((r) => r.code)).toEqual(["GF", "GF2"]);
  });

  it("puts third place in its own block after the winners", () => {
    const blocks = bracketColumns(single8(true));
    expect(blocks.map((b) => b.side)).toEqual(["winners", "third"]);
    expect(blocks[1]?.rounds[0]?.matches.map((m) => m.code)).toEqual(["M7"]);
  });

  it("makes no column for a qualifiers round", () => {
    const b = single8();
    const withQ = {
      ...b,
      rounds: [
        { code: "Q", name: "Qualifiers", side: "qualifiers" as const, order: 0 },
        ...b.rounds,
      ],
      matches: [match("Q1", "Q"), ...b.matches],
    };
    const codes = bracketColumns(withQ).flatMap((blk) => blk.rounds.map((r) => r.code));
    expect(codes).not.toContain("Q");
  });

  it("orders rounds by play order, not list order", () => {
    const b = single8();
    const shuffled = { ...b, rounds: [...b.rounds].reverse() };
    expect(bracketColumns(shuffled)[0]?.rounds.map((r) => r.code)).toEqual(["QF", "SF", "F"]);
  });
});

describe("sideLabel", () => {
  it("names unresolved sources", () => {
    expect(sideLabel({ kind: "winner", match: "M5" })).toBe("Winner of M5");
    expect(sideLabel({ kind: "loser", match: "M2" })).toBe("Loser of M2");
    expect(sideLabel({ kind: "seed", seed: 3 })).toBe("Seed 3");
  });
});
