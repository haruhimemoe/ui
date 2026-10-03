"use client";

import { CommandPalette, CommandPaletteButton, siteCommands } from "@haruhimemoe/ui";

// The 0.8.0 palette, from a client file: commands carry functions.
export function Palette08() {
  return (
    <>
      <CommandPaletteButton>Search</CommandPaletteButton>
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
