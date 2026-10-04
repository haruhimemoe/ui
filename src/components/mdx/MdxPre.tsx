/**
 * @file src/components/mdx/MdxPre.tsx
 * @desc react-markdown/MDX's `pre` override: a fenced code block (a `<pre>` wrapping a single
 *       `<code>` with a `language-*` class) is handed to CodeBlock with its parsed meta; anything
 *       else renders as a plain, focusable `<pre>`. Drops the `node` prop react-markdown passes
 *       to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { Children, type ComponentProps, isValidElement, type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock.js";
import { parseCodeMeta } from "./parseCodeMeta.js";
import { textOf } from "./textOf.js";

/** Every native `<pre>` prop, plus the `node` react-markdown passes (dropped). */
export type MdxPreProps = ComponentProps<"pre"> & { node?: unknown };

type CodeProps = { className?: string; children?: ReactNode; "data-meta"?: string };

/**
 * @function MdxPre
 * @param props {MdxPreProps} native pre props; a single `code` child carries the language class
 *        and the fence's meta string in `data-meta`
 * @returns {JSX.Element} a CodeBlock for a fenced `code` child, otherwise a plain, focusable pre
 */
export function MdxPre({ node: _node, children, ...props }: MdxPreProps) {
  const [child] = Children.toArray(children);
  if (!isValidElement<CodeProps>(child) || child.type !== "code") {
    return (
      <pre
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region needs keyboard focus
        tabIndex={0}
        {...props}
      >
        {children}
      </pre>
    );
  }
  const lang = /(?:^|\s)language-(\S+)/.exec(child.props.className ?? "")?.[1];
  const { title, highlight } = parseCodeMeta(child.props["data-meta"]);
  return (
    <CodeBlock
      code={textOf(child.props.children)}
      lang={lang}
      title={title}
      highlight={highlight}
    />
  );
}
