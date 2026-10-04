/**
 * @file src/components/mdx/highlighter.ts
 * @desc Lazily loads a Shiki core highlighter (CSS-variables theme, a fixed language set, the
 *       no-WASM JS regex engine) and caches it, so apps without Shiki installed don't fail to
 *       build: the import only happens when a code block actually renders, and a load failure
 *       is swallowed (warned once, outside production) rather than thrown.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { HighlighterCore } from "shiki/core";

/** The Shiki CSS-variables theme name CodeBlock renders with. */
export const THEME = "haruhime";

const load = async (): Promise<HighlighterCore> => {
  const [{ createCssVariablesTheme, createHighlighterCore }, { createJavaScriptRegexEngine }] =
    await Promise.all([import("shiki/core"), import("shiki/engine/javascript")]);
  return createHighlighterCore({
    themes: [createCssVariablesTheme({ name: THEME, variablePrefix: "--shiki-" })],
    langs: [
      import("shiki/langs/typescript.mjs"),
      import("shiki/langs/tsx.mjs"),
      import("shiki/langs/javascript.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/langs/bash.mjs"),
      import("shiki/langs/css.mjs"),
      import("shiki/langs/html.mjs"),
      import("shiki/langs/markdown.mjs"),
      import("shiki/langs/diff.mjs"),
      import("shiki/langs/yaml.mjs"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
};

// No node types in the build (tsconfig.build.json "types": []), so read process through globalThis.
const isProduction = (): boolean =>
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
    ?.NODE_ENV === "production";

let cached: Promise<HighlighterCore | null> | undefined;
let warned = false;

/**
 * @function getHighlighter
 * @param loader {() => Promise<HighlighterCore>} loads the highlighter; defaults to the real
 *        Shiki loader, overridable in tests
 * @returns {Promise<HighlighterCore | null>} the cached highlighter, or null if it failed to load
 */
export const getHighlighter = (
  loader: () => Promise<HighlighterCore> = load,
): Promise<HighlighterCore | null> => {
  cached ??= loader().catch((error: unknown) => {
    if (!warned && !isProduction()) {
      warned = true;
      console.warn("@haruhimemoe/ui: Shiki didn't load, so code blocks aren't highlighted.", error);
    }
    return null;
  });
  return cached;
};

/**
 * @function resetHighlighter
 * @returns {void} clears the cached highlighter and warned flag (tests only)
 */
export const resetHighlighter = (): void => {
  cached = undefined;
  warned = false;
};
