/**
 * @file src/mdx.ts
 * @desc The `@haruhimemoe/ui/mdx` subpath: MDX element overrides, article pieces (Figure, Steps,
 *       MdxLinkCard, Schedule, Glossary, Term) and the pieces apps wire them up with. Every
 *       export here is a server component or a plain server-safe function; the only client code
 *       (CodeCopyButton, EmbedFacade) is rendered internally by CodeBlock and Embed, never
 *       exported directly. `CodeBlock` colorizes code only when the app installs `shiki` (an
 *       optional peer dependency) and imports `@haruhimemoe/ui/shiki` once; otherwise code
 *       renders as plain, unstyled text. `MapCard`/`MapGroup` are root exports an app adds to
 *       its own `useMDXComponents` alongside `mdxComponents`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

export { Kbd, type KbdProps } from "./components/basics/Kbd.js";
export type { MdxArticleModule } from "./components/mdx/articleModule.js";
export { Callout, type CalloutProps, type CalloutType } from "./components/mdx/Callout.js";
export { CodeBlock, type CodeBlockProps } from "./components/mdx/CodeBlock.js";
export { Embed, type EmbedProps } from "./components/mdx/Embed.js";
export { Figure, type FigureProps } from "./components/mdx/Figure.js";
export { Glossary, type GlossaryEntry, type GlossaryProps } from "./components/mdx/Glossary.js";
export { MdxLinkCard, type MdxLinkCardProps } from "./components/mdx/MdxLinkCard.js";
export { mdxComponents } from "./components/mdx/mdxComponents.js";
export { type CodeMeta, parseCodeMeta } from "./components/mdx/parseCodeMeta.js";
export { Schedule, type ScheduleItem, type ScheduleProps } from "./components/mdx/Schedule.js";
export { Steps, type StepsProps } from "./components/mdx/Steps.js";
export { Term, type TermProps } from "./components/mdx/Term.js";
export type { ArticleData, TocItem } from "./remark/articleData.js";
export { type EmbedTarget, parseEmbedUrl } from "./remark/embedUrl.js";
export { slugify } from "./remark/slugify.js";
