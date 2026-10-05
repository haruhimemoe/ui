/**
 * @file tests/remark/mdxExports.test.ts
 * @desc Compiles MDX with @mdx-js/mdx and reads the toc, readingMinutes and words exports that
 *       remarkHaruhime's mdxExports option adds; an author's own export wins; off by default;
 *       collect receives the same data.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { describe, expect, it } from "vitest";
import remarkHaruhime, {
  type ArticleData,
  type RemarkHaruhimeOptions,
} from "../../src/remark/index.js";

const SOURCE = "## Seeding\n\nTwo words.\n\n### Tiebreakers\n\n#### Rolls\n";
const run = async (source: string, options: RemarkHaruhimeOptions) =>
  (await evaluate(source, { ...runtime, remarkPlugins: [[remarkHaruhime, options]] })) as Record<
    string,
    unknown
  >;

describe("mdxExports", () => {
  it("exports toc, readingMinutes and words", async () => {
    const mod = await run(SOURCE, { mdxExports: true });
    expect(mod.toc).toEqual([
      { id: "seeding", text: "Seeding", depth: 2 },
      { id: "tiebreakers", text: "Tiebreakers", depth: 3 },
      { id: "rolls", text: "Rolls", depth: 4 },
    ]);
    expect(mod.readingMinutes).toBe(1);
    expect(mod.words).toBe(5);
  });

  it("keeps an author's own export const toc and adds the others", async () => {
    const mine = 'export const toc = [{ id: "mine", text: "Mine", depth: 2 }]\n\n';
    const mod = await run(mine + SOURCE, { mdxExports: true });
    expect(mod.toc).toEqual([{ id: "mine", text: "Mine", depth: 2 }]);
    expect(mod.readingMinutes).toBe(1);
  });

  it("adds no exports by default", async () => {
    const mod = await run(SOURCE, {});
    expect(mod.toc).toBeUndefined();
    expect(mod.readingMinutes).toBeUndefined();
  });

  it("hands the same data to collect", async () => {
    let seen: ArticleData | undefined;
    await run(SOURCE, {
      collect: (data) => {
        seen = data;
      },
    });
    expect(seen?.toc.map((item) => item.id)).toEqual(["seeding", "tiebreakers", "rolls"]);
    expect(seen?.words).toBe(5);
  });
});
