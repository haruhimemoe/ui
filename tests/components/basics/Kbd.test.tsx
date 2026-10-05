/**
 * @file tests/components/basics/Kbd.test.tsx
 * @desc Kbd renders a kbd with the shared classes, merges a caller className last and passes
 *       native props through; the palette's three kbd spots use the same string.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd } from "../../../src/components/basics/Kbd.js";
import { KBD_BASE, kbdClasses } from "../../../src/components/basics/kbdStyles.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Kbd", () => {
  it("renders a kbd with the shared classes and the caller's last", async () => {
    const { container } = render(
      <Kbd title="Control" className="text-sm">
        Ctrl
      </Kbd>,
    );
    const kbd = screen.getByText("Ctrl");
    expect(kbd.tagName).toBe("KBD");
    expect(kbd).toHaveAttribute("title", "Control");
    expect(kbd).toHaveClass("rounded", "border-b3", "bg-b5", "px-1.5", "text-sm");
    expect(kbd).not.toHaveClass("text-xs");
    await expectNoAxeViolations(container);
  });

  it("keeps the exact classes the palette had", () => {
    const set = (s: string) => s.split(" ").sort();
    // PaletteRow's 0.12.0 string; the button and footer gain contrast-more:border-c4 (Rulings).
    expect(set(kbdClasses)).toEqual(
      set(
        "rounded border border-b3 bg-b5 px-1.5 font-sans text-c3 text-xs contrast-more:border-c4",
      ),
    );
    expect(set(`${KBD_BASE} px-1`)).toEqual(
      set("rounded border border-b3 bg-b5 px-1 font-sans text-c3 contrast-more:border-c4"),
    );
  });

  it("is the only kbd class string in the palette", () => {
    for (const file of ["CommandPaletteButton.tsx", "PaletteRow.tsx", "PaletteFooter.tsx"]) {
      const text = readFileSync(`src/components/palette/${file}`, "utf8");
      expect(text, file).not.toMatch(/const KBD = /);
      expect(text, file).toMatch(/from "\.\.\/basics\/kbdStyles\.js"/);
    }
  });
});
