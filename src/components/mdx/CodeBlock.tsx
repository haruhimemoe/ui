/**
 * @file src/components/mdx/CodeBlock.tsx
 * @desc A fenced code block rendered with Shiki highlighting when the app registered it (by
 *       importing `@haruhimemoe/ui/shiki`) and the language is one of the bundled set, plain text
 *       otherwise. Async so it can await the lazily-loaded highlighter from highlighter.ts.
 *       Server-safe: the only client piece is the copy button (CodeCopyButton).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Tue Oct 6, 2026
 */

import type { ComponentProps } from "react";
import type { ThemedToken } from "shiki/core";
import { cx } from "../../utils/cx.js";
import { CodeCopyButton } from "./CodeCopyButton.js";
import { getHighlighter, THEME } from "./highlighter.js";

/** The code (any line endings, trailing newline optional), language, title, highlighted lines
 *  and every other native `<div>` prop (spread onto the wrapper). */
export type CodeBlockProps = Omit<ComponentProps<"div">, "title" | "children"> & {
  code: string;
  lang?: string | undefined;
  title?: string | undefined;
  highlight?: readonly number[] | undefined;
};

const BASE = "block min-h-6 border-l-2 px-3";
const LINE = `${BASE} border-transparent`;
// Never both border colors on one element: Tailwind emits border-h1 before border-transparent.
const MARKED = `${BASE} border-h1 bg-b4 forced-colors:border-[Highlight]`;

/** Shiki's tokens per line, or null to render plain text. */
const tokenize = async (
  code: string,
  lang: string | undefined,
): Promise<ThemedToken[][] | null> => {
  if (!lang) return null;
  const highlighter = await getHighlighter();
  if (!highlighter?.getLoadedLanguages().includes(lang.toLowerCase())) return null;
  try {
    return highlighter.codeToTokens(code, { lang: lang.toLowerCase(), theme: THEME }).tokens;
  } catch {
    return null;
  }
};

const tokenStyle = (token: ThemedToken) => ({
  color: token.color,
  fontStyle: (token.fontStyle ?? 0) & 1 ? "italic" : undefined,
  fontWeight: (token.fontStyle ?? 0) & 2 ? "bold" : undefined,
});

/**
 * @function CodeBlock
 * @param props {CodeBlockProps} the code, optional language, title, highlighted line numbers and
 *        wrapper class
 * @returns {Promise<JSX.Element>} a header (name and copy button) over a highlighted `<pre>`
 */
export async function CodeBlock({
  code,
  lang,
  title,
  highlight = [],
  className,
  ...rest
}: CodeBlockProps) {
  const text = code.replace(/\r\n?/g, "\n").replace(/\n$/, "");
  const tokens = await tokenize(text, lang);
  const lines =
    tokens ?? text.split("\n").map((content) => [{ content, offset: 0 } as ThemedToken]);
  const marked = new Set(highlight);
  const name = title ?? lang;
  return (
    <div
      className={cx(
        "mt-3 overflow-hidden rounded-md border border-b3 bg-b6 contrast-more:border-c4",
        className,
      )}
      {...rest}
    >
      <div className="flex min-h-9 items-center justify-between gap-3 border-b3 border-b px-3 py-1 text-c3 text-sm">
        <span className="truncate">{name ?? "Code"}</span>
        <CodeCopyButton code={text} label={title ? `Copy ${title}` : "Copy code"} />
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: a named, focusable scroll box; fieldset is wrong here */}
      <pre
        role="group"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region needs keyboard focus
        tabIndex={0}
        aria-label={name ? `Code: ${name}` : "Code"}
        className="relative overflow-x-auto py-3 text-c2 text-sm leading-6"
      >
        <code>
          {/* Each line is its own display:block span, so no "\n" text node between them: inside
              the <pre> it would render as an extra blank line. The copy button copies `text`. */}
          {lines.map((line, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: lines have no other identity
              key={index}
              className={marked.has(index + 1) ? MARKED : LINE}
              data-highlighted={marked.has(index + 1) ? "" : undefined}
            >
              {line.map((token, i) =>
                tokens ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: tokens have no other identity
                  <span key={i} style={tokenStyle(token)}>
                    {token.content}
                  </span>
                ) : (
                  token.content
                ),
              )}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
