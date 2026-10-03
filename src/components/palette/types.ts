/**
 * @file src/components/palette/types.ts
 * @desc The command palette's data: a Command (leaf with `run`, or nested with `page`, with
 *       optional `args` collected first), a Page (static commands and async providers), a
 *       Provider (search as you type), an ArgSpec (one prompt), the PaletteContext a command
 *       runs with, and CommandPalette's props. Plain types, server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { ReactNode } from "react";

/** One row of a "choice" argument. */
export type ArgChoice = { value: string; label: string; subtitle?: string | undefined };

/** One prompt collected before a command runs. */
export type ArgSpec = {
  name: string;
  /** The input's placeholder while collecting it. */
  label: string;
  type: "text" | "number" | "choice";
  /** For "choice": the rows to pick from, fuzzy-filtered by the input. */
  choices?: readonly ArgChoice[] | undefined;
  /** Returns a message to block Enter. */
  validate?: ((value: string) => string | undefined) | undefined;
};

/** Rows searched as the query changes. `search` must honor the signal. */
export type Provider = {
  id: string;
  /** Group heading for its rows. Default: the page title. */
  group?: string | undefined;
  /** Characters before the first search. Default 2. */
  minLength?: number | undefined;
  /** Debounce in ms. Default 200. */
  debounceMs?: number | undefined;
  search: (query: string, signal: AbortSignal) => Promise<readonly Command[]>;
};

/** A list the palette can show: static rows, async rows, or both. */
export type Page = {
  title: string;
  /** Input placeholder. Default "Search…". */
  placeholder?: string | undefined;
  commands?: readonly Command[] | undefined;
  providers?: readonly Provider[] | undefined;
};

/** What a command runs with. */
export type PaletteContext = {
  /** `router.push`. */
  navigate: (href: string) => void;
  close: () => void;
  /** Push a page; opens the palette first when it's closed. */
  push: (page: Page) => void;
  /** Writes to the clipboard and announces "Copied" (or the failure). */
  copy: (text: string) => Promise<void>;
  /** `usePathname()`, "" outside the router. */
  pathname: string;
  /** Every root command, after `when`. */
  commands: readonly Command[];
};

/** One row. Exactly one of `run` and `page` is set. */
export type Command = {
  /** Unique in the app. Recents are stored by it. */
  id: string;
  title: string;
  subtitle?: string | undefined;
  icon?: ReactNode;
  /** Matched at a lower weight than the title. */
  keywords?: readonly string[] | undefined;
  /** Heading the row sits under. Default "Commands". */
  group?: string | undefined;
  /** "mod+shift+c", "?" or a chord "g p". Shown as kbd and active while the palette is mounted. */
  shortcut?: string | undefined;
  /** Hidden when false. Read on every render of the list. */
  when?: ((ctx: PaletteContext) => boolean) | undefined;
  run?: ((ctx: PaletteContext, args: Record<string, string>) => void | Promise<void>) | undefined;
  page?: Page | undefined;
  args?: readonly ArgSpec[] | undefined;
  /** Close after `run`. Default true. */
  closeOnRun?: boolean | undefined;
};

/** CommandPalette's props. */
export type CommandPaletteProps = {
  commands: readonly Command[];
  /** Searched at the root once the query reaches each one's minLength. */
  providers?: readonly Provider[] | undefined;
  /** Namespaces recents in localStorage. Default "default". */
  storageKey?: string | undefined;
  /** Default "mod+k". */
  hotkey?: string | undefined;
  /** Root placeholder. Default "Search commands…". */
  placeholder?: string | undefined;
  /** The dialog's accessible name. Default "Command palette". */
  label?: string | undefined;
  /** Default true. */
  calculator?: boolean | undefined;
  /** Default true. */
  recents?: boolean | undefined;
  /** Classes for the panel. */
  className?: string | undefined;
};
