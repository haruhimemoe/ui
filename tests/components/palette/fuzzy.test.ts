/**
 * @file tests/components/palette/fuzzy.test.ts
 * @desc fuzzyScore: subsequence match, word-start and consecutive bonuses, prefix bonus, gap
 *       penalty, ranges; scoreCommand weights; rankResults order and boost.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import { fuzzyScore, rankResults, scoreCommand } from "../../../src/components/palette/fuzzy.js";
import type { Command } from "../../../src/components/palette/types.js";

describe("fuzzyScore", () => {
  it("is null when a query character is missing, and 0 for an empty query", () => {
    expect(fuzzyScore("xyz", "Copy page URL")).toBeNull();
    expect(fuzzyScore("", "anything")).toEqual({ score: 0, ranges: [] });
    expect(fuzzyScore("   ", "anything")).toEqual({ score: 0, ranges: [] });
  });

  it("matches case-insensitively and reports ranges", () => {
    const match = fuzzyScore("cpu", "Copy page URL");
    expect(match?.ranges).toEqual([
      [0, 1],
      [5, 6],
      [10, 11],
    ]);
  });

  it("scores a prefix above a scattered match, and word starts above mid-word", () => {
    const prefix = fuzzyScore("copy", "Copy page URL")?.score ?? 0;
    const scattered = fuzzyScore("cpl", "Copy page URL")?.score ?? 0;
    expect(prefix).toBeGreaterThan(scattered);
    const wordStart = fuzzyScore("gp", "go to pools")?.score ?? 0;
    const mid = fuzzyScore("op", "go to pools")?.score ?? 0;
    expect(wordStart).toBeGreaterThan(mid);
  });

  it("merges consecutive matches into one range and treats camelCase as word starts", () => {
    expect(fuzzyScore("pa", "Copy page")?.ranges).toEqual([[5, 7]]);
    expect(fuzzyScore("cu", "copyUrl")?.score).toBeGreaterThan(
      fuzzyScore("cr", "copyUrl")?.score ?? 0,
    );
  });

  it("survives regex characters in the query", () => {
    expect(fuzzyScore("(*", "a (b*)")).not.toBeNull();
    expect(fuzzyScore("[", "no brackets")).toBeNull();
  });
});

const cmd = (id: string, extra: Partial<Command> = {}): Command => ({
  id,
  title: id,
  run: () => {},
  ...extra,
});

describe("scoreCommand", () => {
  it("takes the best weighted field: title 1, keywords 0.7, subtitle 0.5, group 0.3", () => {
    const byTitle = scoreCommand("copy", cmd("Copy URL"));
    const byKeyword = scoreCommand("copy", cmd("Share", { keywords: ["copy"] }));
    const bySubtitle = scoreCommand("copy", cmd("Share", { subtitle: "copy link" }));
    const byGroup = scoreCommand("copy", cmd("Share", { group: "copy" }));
    expect(byTitle?.score ?? 0).toBeGreaterThan(byKeyword?.score ?? 0);
    expect(byKeyword?.score ?? 0).toBeGreaterThan(bySubtitle?.score ?? 0);
    expect(bySubtitle?.score ?? 0).toBeGreaterThan(byGroup?.score ?? 0);
    expect(byKeyword?.ranges).toEqual([]);
    expect(byTitle?.ranges).toEqual([[0, 4]]);
  });

  it("is null when nothing matches", () => {
    expect(scoreCommand("zzz", cmd("Copy URL", { keywords: ["share"] }))).toBeNull();
  });
});

describe("rankResults", () => {
  it("sorts by score, then boost, then declaration order", () => {
    const list = [cmd("Copy page"), cmd("Copy URL"), cmd("Open copy"), cmd("Nope")];
    const plain = rankResults("copy", list, () => 0).map((r) => r.command.id);
    expect(plain).toEqual(["Copy page", "Copy URL", "Open copy"]);
    const boosted = rankResults("copy", list, (id) => (id === "Copy URL" ? 3 : 0)).map(
      (r) => r.command.id,
    );
    expect(boosted).toEqual(["Copy URL", "Copy page", "Open copy"]);
  });
});
