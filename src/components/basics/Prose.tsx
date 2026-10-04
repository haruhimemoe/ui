/**
 * @file src/components/basics/Prose.tsx
 * @desc Long-form typography for MDX, docs and legal text, styled with the osu!-web tokens.
 *       Styles the plain elements inside it (headings, links, lists, code, tables, blockquotes).
 *       The element that opens the block gets no top margin, so a leading heading sits flush. Any
 *       `pre` at any depth (including one nested inside `li` or `blockquote`) gets Prose's fence
 *       styles, except CodeBlock's own `pre` (`role="group"`, the `./mdx` subpath's fenced code
 *       renderer), which keeps its own look untouched.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sat Oct 3, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<div>` prop (including `ref`). */
export type ProseProps = ComponentProps<"div">;

/**
 * @function Prose
 * @param props {ProseProps} native div props; children are the rendered Markdown or MDX
 * @returns {JSX.Element} a max-w-3xl `<div>` that styles the headings, links, lists, code,
 *          tables and blockquotes inside it. Its first child's top margin is zeroed
 *          (`[&>:first-child]:mt-0`), which outranks the h2 and h3 margins by specificity.
 */
export function Prose({ className, ...props }: ProseProps) {
  return (
    <div
      className={cx(
        "max-w-3xl text-c2 leading-relaxed [&>:first-child]:mt-0 [&_a:hover]:text-c1 [&_a]:text-h1 [&_a]:underline [&_blockquote]:mt-3 [&_blockquote]:border-b2 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-c3 [&_code]:rounded [&_code]:bg-b4 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:text-c1 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-c1 [&_h3]:text-lg [&_hr]:my-8 [&_hr]:border-b3 [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3 [&_pre:not([role=group])]:mt-3 [&_pre:not([role=group])]:overflow-x-auto [&_pre:not([role=group])]:rounded-md [&_pre:not([role=group])]:bg-b6 [&_pre:not([role=group])]:p-3 [&_pre:not([role=group])]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-c1 [&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_td]:border-b3 [&_td]:border-b [&_td]:px-2 [&_td]:py-1.5 [&_th]:border-b3 [&_th]:border-b [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-c1 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6",
        className,
      )}
      {...props}
    />
  );
}
