/**
 * @file src/components/basics/linkStyles.ts
 * @desc Class builder for text links, shared by TextLink and any element that should look like
 *       one: `accent` for links in running text (h1, underlined, like Prose), `plain` for names
 *       and titles in lists and tables (bold c1, underlined on hover).
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { cx } from "../../utils/cx.js";

/** A text link's look: `accent` in running text, `plain` for a name or title in a list. */
export type TextLinkVariant = "accent" | "plain";

/** Options for {@link linkClasses}. */
export type LinkClassOptions = {
  variant?: TextLinkVariant | undefined;
  className?: string | undefined;
};

// The accent link is underlined at rest, so it doesn't rely on color alone (WCAG 1.4.1). A plain
// link sits where the context says it's a link (a list of names), and underlines on hover.
const VARIANTS: Record<TextLinkVariant, string> = {
  accent: "text-h1 underline underline-offset-2 transition-colors hover:text-c1",
  plain: "font-bold text-c1 underline-offset-2 hover:underline",
};

/**
 * @function linkClasses
 * @param opts {LinkClassOptions} variant (default "accent") and extra classes
 * @returns {string} the text link classes, with the caller's className appended last (it
 *          replaces a built-in class that sets the same property)
 */
export const linkClasses = ({ variant = "accent", className }: LinkClassOptions = {}): string =>
  cx(VARIANTS[variant], className);
