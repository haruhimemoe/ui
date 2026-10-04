/**
 * @file src/components/mdx/Callout.tsx
 * @desc A labelled aside for MDX prose (note, tip, warning): a left-border panel with an icon and
 *       a bold label, rendered by MdxBlockquote for a GitHub-style `> [!NOTE]` blockquote, or
 *       usable directly in hand-written MDX.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import type { CalloutType } from "../../remark/callouts.js";
import { cx } from "../../utils/cx.js";

export type { CalloutType };

/** Every native `<div>` prop except `title` (replaced by the callout's own label slot). */
export type CalloutProps = Omit<ComponentProps<"div">, "title"> & {
  type?: CalloutType | undefined;
  title?: ReactNode;
};

const LABEL: Record<CalloutType, string> = { note: "Note", tip: "Tip", warning: "Warning" };
const BORDER: Record<CalloutType, string> = {
  note: "border-h1",
  tip: "border-c2",
  warning: "border-h2",
};
const ICON: Record<CalloutType, string> = {
  note: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2Zm0-8h-2V7h2Z",
  tip: "M9 21h6v-2H9Zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z",
  warning: "M1 21h22L12 2Zm12-3h-2v-2h2Zm0-4h-2v-4h2Z",
};

/**
 * @function Callout
 * @param props {CalloutProps} the callout type (default "note"), an optional title replacing
 *        the type's default label, native div props and children
 * @returns {JSX.Element} a bordered, labelled panel announced as a note
 */
export function Callout({ type = "note", title, className, children, ...props }: CalloutProps) {
  return (
    <div
      role="note"
      className={cx("mt-4 rounded-md border-l-4 bg-b5 px-4 py-3 text-c2", BORDER[type], className)}
      {...props}
    >
      <p className="mt-0! flex items-center gap-2 font-bold text-c1">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0 fill-current">
          <path d={ICON[type]} />
        </svg>
        {title ?? LABEL[type]}
      </p>
      <div className="[&>:first-child]:mt-1">{children}</div>
    </div>
  );
}
