/**
 * @file src/components/palette/labels.ts
 * @desc The command palette's built-in text, English by default. CommandPalette takes a
 *       Partial<PaletteLabels> as `labels` and fills the rest from PALETTE_LABELS. Functions
 *       take the counts and queries they name, so an app can pass its translator's plural rules.
 *       Plain data, server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 11, 2026
 * @modified Sun Oct 11, 2026
 */

/** Every string the palette writes itself. */
export type PaletteLabels = {
  /** The footer count. */
  results: (count: number) => string;
  /** The list's accessible name. */
  list: string;
  /** A pushed page's placeholder when it sets none. */
  searchPlaceholder: string;
  /** Key hints in the footer. */
  navigate: string;
  select: string;
  back: string;
  close: string;
  /** Argument errors. */
  required: string;
  enterNumber: string;
  /** ctx.copy's status. */
  copied: string;
  copyFailed: string;
  /** Group headings. */
  recent: string;
  commands: string;
  calculator: string;
  /** The default heading for a provider's rows. */
  providerResults: string;
  /** The calculator row's subtitle. */
  enterToCopy: string;
  /** Provider hints. */
  typeToSearch: (min: number) => string;
  searching: string;
  searchFailed: string;
  noResults: (query: string) => string;
  /** No command matched and there are no providers. */
  noMatches: string;
};

/** The English defaults. */
export const PALETTE_LABELS: PaletteLabels = {
  results: (count) => `${count} ${count === 1 ? "result" : "results"}`,
  list: "Results",
  searchPlaceholder: "Search…",
  navigate: "navigate",
  select: "select",
  back: "back",
  close: "close",
  required: "Required",
  enterNumber: "Enter a number",
  copied: "Copied",
  copyFailed: "Couldn't copy",
  recent: "Recent",
  commands: "Commands",
  calculator: "Calculator",
  providerResults: "Results",
  enterToCopy: "Enter to copy",
  typeToSearch: (min) => `Type ${min} characters to search`,
  searching: "Searching…",
  searchFailed: "Couldn't search, try again",
  noResults: (query) => `No results for “${query}”`,
  noMatches: "No matching commands",
};
