/**
 * @file src/mdx.ts
 * @desc The `@haruhimemoe/ui/mdx` subpath: MDX element overrides and the pieces apps wire them
 *       up with. Every export here is a server component or a plain server-safe function; the
 *       only client code (CodeCopyButton) is rendered internally by CodeBlock, never exported.
 *       `CodeBlock` needs `shiki` installed to colorize code (`shiki` is an optional peer
 *       dependency); without it, code renders as plain, unstyled text.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

export { Callout, type CalloutProps, type CalloutType } from "./components/mdx/Callout.js";
export { CodeBlock, type CodeBlockProps } from "./components/mdx/CodeBlock.js";
export { mdxComponents } from "./components/mdx/mdxComponents.js";
export { type CodeMeta, parseCodeMeta } from "./components/mdx/parseCodeMeta.js";
export { slugify } from "./remark/slugify.js";
