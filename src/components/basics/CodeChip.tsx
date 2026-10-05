/**
 * @file src/components/basics/CodeChip.tsx
 * @desc An inline code chip (`bun add @haruhimemoe/ui`) with an optional copy button: the
 *       code in a b6 pill that wraps anywhere, then CodeBlock's own copy button (finished
 *       classes, so no tailwind-merge reaches the browser). Inside a LinkCard the button is
 *       lifted above the card link. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { CodeCopyButton } from "../mdx/CodeCopyButton.js";

/** Every native `<span>` prop, plus the code, whether to show Copy, and its accessible name. */
export type CodeChipProps = Omit<ComponentProps<"span">, "children"> & {
  code: string;
  /** Show the copy button (default true). */
  copy?: boolean | undefined;
  /** The copy button's name; starts with its visible "Copy" (default `Copy ${code}`). */
  copyLabel?: string | undefined;
};

/**
 * @function CodeChip
 * @param props {CodeChipProps} the code, copy (default true), copyLabel, plus native span props
 * @returns {JSX.Element} the chip and its copy button
 */
export function CodeChip({ code, copy = true, copyLabel, className, ...props }: CodeChipProps) {
  return (
    <span className={cx("inline-flex flex-wrap items-center gap-2", className)} {...props}>
      <code className="wrap-anywhere rounded bg-b6 px-2 py-1 font-mono text-c2 text-sm">
        {code}
      </code>
      {copy ? <CodeCopyButton code={code} label={copyLabel ?? `Copy ${code}`} /> : null}
    </span>
  );
}
