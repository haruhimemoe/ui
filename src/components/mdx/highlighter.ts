/**
 * @file src/components/mdx/highlighter.ts
 * @desc The highlighter CodeBlock asks for. Nothing here names Shiki outside `import type`, so
 *       an app without Shiki builds: `@haruhimemoe/ui/shiki` (src/shiki.ts) registers the real
 *       loader when an app imports it. The loader lives in a `globalThis` slot keyed by
 *       `Symbol.for`, so it survives duplicate copies of this module. The first highlighter is
 *       cached; with no loader registered, or a loader that rejects, code renders plain (warned
 *       once, outside production) rather than throwing.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { HighlighterCore } from "shiki/core";

/** The Shiki CSS-variables theme name CodeBlock renders with. */
export const THEME = "haruhime";

/** Loads a Shiki highlighter: what `@haruhimemoe/ui/shiki` registers. */
export type HighlighterLoader = () => Promise<HighlighterCore>;

const SLOT = Symbol.for("@haruhimemoe/ui/highlighter");
type Registry = { [SLOT]?: HighlighterLoader | undefined };

// No node types in the build (tsconfig.build.json "types": []), so read process through globalThis.
const isProduction = (): boolean =>
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.NODE_ENV === "production";

let cached: Promise<HighlighterCore | null> | undefined;
let warned = false;

const warnOnce = (message: string, error?: unknown): void => {
  if (warned || isProduction()) return;
  warned = true;
  if (error === undefined) console.warn(message);
  else console.warn(message, error);
};

/**
 * @function setHighlighterLoader
 * @param loader {HighlighterLoader} loads the Shiki highlighter; replaces any earlier one
 * @returns {void} registers the loader in the global slot and drops the cached highlighter
 */
export const setHighlighterLoader = (loader: HighlighterLoader): void => {
  (globalThis as Registry)[SLOT] = loader;
  cached = undefined;
};

/**
 * @function getHighlighter
 * @param loader {HighlighterLoader | undefined} loads the highlighter; defaults to the registered
 *        one, overridable in tests
 * @returns {Promise<HighlighterCore | null>} the cached highlighter, or null when no loader is
 *          registered or it failed to load
 */
export const getHighlighter = (
  loader: HighlighterLoader | undefined = (globalThis as Registry)[SLOT],
): Promise<HighlighterCore | null> => {
  if (!loader) {
    warnOnce(
      '@haruhimemoe/ui: code blocks aren\'t highlighted. Install shiki and add `import "@haruhimemoe/ui/shiki";` once, e.g. in mdx-components.tsx.',
    );
    return Promise.resolve(null);
  }
  cached ??= loader().catch((error: unknown) => {
    warnOnce("@haruhimemoe/ui: Shiki didn't load, so code blocks aren't highlighted.", error);
    return null;
  });
  return cached;
};

/**
 * @function resetHighlighter
 * @returns {void} clears the registered loader, the cached highlighter and the warned flag
 *          (tests only)
 */
export const resetHighlighter = (): void => {
  (globalThis as Registry)[SLOT] = undefined;
  cached = undefined;
  warned = false;
};
