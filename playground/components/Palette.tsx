"use client";

import {
  type Command,
  CommandPalette,
  fuzzyScore,
  type Provider,
  siteCommands,
} from "@haruhimemoe/ui";
import { useState } from "react";
import { BEATMAPS } from "@/data/beatmaps";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Second", href: "/second" },
  { label: "osu!", href: "https://osu.ppy.sh" },
];

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      console.info("[playground] search aborted");
      reject(new DOMException("aborted", "AbortError"));
    });
  });

const beatmaps: Provider = {
  id: "beatmaps",
  group: "Beatmaps",
  search: async (query, signal) => {
    await wait(400, signal);
    return BEATMAPS.map((map) => ({ map, match: fuzzyScore(query, `${map.artist} ${map.title}`) }))
      .filter((entry) => entry.match !== null)
      .sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0))
      .slice(0, 8)
      .map(
        ({ map }): Command => ({
          id: `map.${map.id}`,
          title: `${map.artist} - ${map.title}`,
          subtitle: `${map.stars}★ · #${map.id}`,
          run: (ctx) => ctx.copy(String(map.id)),
        }),
      );
  },
};

const ROOT_PROVIDERS: Provider[] = [beatmaps];

export function Palette() {
  const [dark, setDark] = useState(true);
  const commands: Command[] = [
    ...siteCommands({
      pages: NAV,
      tools: "pools",
      // The playground's "own" repo: an app passes its own, so Report a bug lands there.
      repo: "https://github.com/haruhimemoe/ui",
      account: { signedIn: false, signInHref: "/second", accountHref: "/second", signOutHref: "/" },
    }),
    {
      id: "maps",
      title: "Search beatmaps…",
      group: "Demo",
      shortcut: "g b",
      page: { title: "Beatmaps", placeholder: "Artist or title", providers: [beatmaps] },
    },
    {
      id: "mods",
      title: "Pick a mod…",
      group: "Demo",
      page: {
        title: "Mods",
        commands: ["HD", "HR", "DT", "FM", "NM"].map((mod) => ({
          id: `mod.${mod}`,
          title: mod,
          run: (ctx) => ctx.copy(mod),
        })),
      },
    },
    {
      id: "jump",
      title: "Jump to beatmap…",
      group: "Demo",
      args: [
        { name: "id", label: "Beatmap id", type: "number" },
        {
          name: "mod",
          label: "Mod",
          type: "choice",
          choices: [
            { value: "HD", label: "Hidden" },
            { value: "HR", label: "Hard Rock" },
            { value: "DT", label: "Double Time", subtitle: "1.5x" },
          ],
        },
      ],
      run: (ctx, args) => ctx.navigate(`/second?id=${args.id}&mod=${args.mod}`),
    },
    {
      id: "theme",
      title: dark ? "Light mode (demo toggle)" : "Dark mode (demo toggle)",
      group: "Demo",
      closeOnRun: false,
      shortcut: "mod+shift+l",
      run: () => setDark((d) => !d),
    },
  ];
  return <CommandPalette storageKey="playground" commands={commands} providers={ROOT_PROVIDERS} />;
}
