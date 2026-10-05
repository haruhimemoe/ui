/**
 * @file tests/components/dialogs/dialogStyles.test.ts
 * @desc The dialogs' finished class strings: the failure text matches textClasses' error tone,
 *       the open fade uses the motion tokens, and the panel keeps a real border for forced colors.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { describe, expect, it } from "vitest";
import { textClasses } from "../../../src/components/basics/textStyles.js";
import {
  CONFIRM_ERROR,
  DIALOG_BASE,
  DIALOG_FRAME,
  DIALOG_MOTION,
  PANEL_BASE,
} from "../../../src/components/dialogs/dialogStyles.js";

const words = (classes: string) => classes.split(/\s+/).filter(Boolean).sort();

describe("dialogStyles", () => {
  it("writes the failure text as textClasses' error tone, finished", () => {
    expect(words(CONFIRM_ERROR)).toEqual(words(textClasses({ tone: "error" })));
  });

  it("fades in with the motion tokens and leaves close instant", () => {
    expect(words(DIALOG_MOTION)).toEqual(
      expect.arrayContaining([
        "duration-short",
        "ease-standard",
        "starting:opacity-0",
        "starting:scale-98",
        "starting:backdrop:opacity-0",
      ]),
    );
  });

  it("keeps a real border on the panel and a transparent, unpadded dialog", () => {
    expect(words(PANEL_BASE)).toEqual(expect.arrayContaining(["border", "border-b3", "bg-b6"]));
    expect(words(DIALOG_BASE)).toEqual(expect.arrayContaining(["bg-transparent", "p-0"]));
    // Display only while open: a bare `flex` would beat the browser's dialog:not([open]) rule.
    expect(words(DIALOG_FRAME)).toContain("open:flex");
    expect(words(DIALOG_FRAME)).not.toContain("flex");
  });
});
