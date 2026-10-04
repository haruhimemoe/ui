/**
 * @file src/shiki.ts
 * @desc The `@haruhimemoe/ui/shiki` subpath: registers the Shiki loader CodeBlock highlights
 *       with (a core highlighter, the CSS-variables theme, a fixed language set and the no-WASM
 *       JS regex engine). Apps that render code install `shiki` and import this once, for its
 *       side effect: `import "@haruhimemoe/ui/shiki";` (in mdx-components.tsx, say). Nothing
 *       else in the package names Shiki, so an app that skips this import builds without it
 *       and gets plain code blocks.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { HighlighterCore } from "shiki/core";
import { setHighlighterLoader, THEME } from "./components/mdx/highlighter.js";

/**
 * @function loadShiki
 * @returns {Promise<HighlighterCore>} a Shiki core highlighter with the package's theme and
 *          languages, loaded through dynamic import()
 */
const loadShiki = async (): Promise<HighlighterCore> => {
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

setHighlighterLoader(loadShiki);
