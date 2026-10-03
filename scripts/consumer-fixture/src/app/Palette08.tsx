"use client";

import {
  CommandPalette,
  CommandPaletteButton,
  evaluate,
  formatResult,
  fuzzyScore,
  openCommandPalette,
  siteCommands,
} from "@haruhimemoe/ui";

// The 0.8.0 palette, from a client file: commands carry functions. The helpers it exports are
// exercised here too, so the consumer check sees every runtime export in use.
export function Palette08() {
  const sum = evaluate("2*21");
  const match = fuzzyScore("cpu", "Copy page URL");
  return (
    <>
      <CommandPaletteButton>Search</CommandPaletteButton>
      <button type="button" onClick={() => openCommandPalette({ title: "Demo page" })}>
        Open the demo page
      </button>
      <p>
        {sum === null ? "no sum" : formatResult(sum)} · {match?.score ?? 0}
      </p>
      <CommandPalette
        storageKey="consumer"
        commands={[
          ...siteCommands({
            pages: [{ label: "Home", href: "/" }],
            tools: "packs",
            repo: "https://github.com/haruhimemoe/ui",
          }),
          { id: "demo", title: "Demo", run: () => {} },
        ]}
      />
    </>
  );
}
