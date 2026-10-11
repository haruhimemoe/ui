/**
 * @file src/components/mdx/codeLabels.ts
 * @desc CodeBlock's built-in text, English by default. Plain data, server-safe, no cx, so the
 *       client CodeCopyButton can import it too.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 11, 2026
 * @modified Sun Oct 11, 2026
 */

/** Every string CodeBlock and its copy button write themselves. */
export type CodeBlockLabels = {
  /** The copy button's visible text. */
  copy: string;
  /** The status after a copy. */
  copied: string;
  copyFailed: string;
  /** The header and scroll box name with no title or language. */
  code: string;
  /** The copy button's accessible name: with the title, or without (null). */
  copyName: (title: string | null) => string;
  /** The scroll box's accessible name for a title or language. */
  codeName: (name: string) => string;
};

/** The English defaults. */
export const CODE_BLOCK_LABELS: CodeBlockLabels = {
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Copy failed",
  code: "Code",
  copyName: (title) => (title ? `Copy ${title}` : "Copy code"),
  codeName: (name) => `Code: ${name}`,
};
