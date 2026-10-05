/**
 * @file tests/foundations.test.ts
 * @desc The 0.12.0 media classes across the kit: 44px targets on a coarse pointer, c4 edges under
 *       more contrast, 1px borders in forced colors. jsdom can't evaluate the media queries (the
 *       consumer check and play:axe do, in Chromium); this pins the classes. Exported constants are
 *       imported; file-private ones are read from the source.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CARD } from "../src/components/basics/cardStyles.js";
import { CHIP, CHIP_OFF, CHIP_UNAVAILABLE } from "../src/components/filters/chipStyles.js";

const RING = ["contrast-more:inset-ring", "contrast-more:inset-ring-c4"];
const source = (file: string) =>
  readFileSync(path.join(import.meta.dirname, "../src/components", file), "utf8");
const classes = (value: string) => value.split(" ");

describe("exported constants", () => {
  it("edges the card in c4 under more contrast and borders it in forced colors", () => {
    expect(classes(CARD)).toEqual(expect.arrayContaining([...RING, "forced-colors:border"]));
  });

  it("grows chips to 44px on a coarse pointer, as flex boxes so a label chip can", () => {
    expect(classes(CHIP)).toEqual(
      expect.arrayContaining(["inline-flex", "items-center", "coarse:min-h-11", "coarse:px-3.5"]),
    );
    expect(classes(CHIP_OFF)).toEqual(expect.arrayContaining([...RING, "forced-colors:border"]));
    expect(classes(CHIP_UNAVAILABLE)).toContain("forced-colors:text-[GrayText]");
  });
});

describe("file-private classes", () => {
  const cases: [string, string[]][] = [
    ["basics/Badge.tsx", ["forced-colors:border", ...RING, "contrast-more:border-c4"]],
    ["basics/Tabs.tsx", [...RING, "forced-colors:border", "coarse:min-h-11"]],
    ["basics/disclosureStyles.ts", ["coarse:min-h-11"]],
    ["filters/FilterPanel.tsx", ["coarse:size-11"]],
    ["shell/LinkTabs.tsx", ["inline-flex", "items-center", "coarse:min-h-11"]],
    ["shell/HeaderMenu.tsx", ["coarse:min-h-11", "coarse:py-3", "contrast-more:border-c4"]],
    ["palette/PaletteRow.tsx", ["coarse:min-h-11"]],
    ["palette/CommandPalette.tsx", ["contrast-more:border-c4"]],
    ["basics/kbdStyles.ts", ["contrast-more:border-c4"]],
    ["mdx/CodeCopyButton.tsx", ["coarse:min-h-11", "coarse:min-w-11"]],
    ["mdx/CodeBlock.tsx", ["contrast-more:border-c4"]],
  ];
  it.each(cases)("%s carries its media classes", (file, wanted) => {
    const text = source(file);
    for (const name of wanted) expect(text, `${file}: ${name}`).toContain(name);
  });

  it("pads both ContentNav link strings on a coarse pointer", () => {
    const text = source("content/contentNavStyles.ts");
    expect(text.match(/coarse:py-2\.5/g)).toHaveLength(2);
  });
});
