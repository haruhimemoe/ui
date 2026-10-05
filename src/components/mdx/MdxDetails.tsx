/**
 * @file src/components/mdx/MdxDetails.tsx
 * @desc react-markdown/MDX's `details` override: a native `<details>`/`<summary>` pair (no JS, so
 *       browser find-in-page opens it) with the summary styled like Disclosure's toggle button and
 *       a CSS-only ▾/▴ arrow swapped by the open state. Drops the `node` prop react-markdown passes
 *       to every component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { Children, type ComponentProps, cloneElement, isValidElement, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { DISCLOSURE_TOGGLE } from "../basics/disclosureStyles.js";

/** Native details props, plus react-markdown's node (dropped). */
export type MdxDetailsProps = ComponentProps<"details"> & { node?: unknown };

const SUMMARY = `${DISCLOSURE_TOGGLE} cursor-pointer list-none [&::-webkit-details-marker]:hidden`;

/**
 * @function MdxDetails
 * @param props {MdxDetailsProps} native details props; children hold the summary and the body
 * @returns {JSX.Element} a native `<details>` (no JS, find-in-page opens it) whose summary looks
 *          like Disclosure's button, with a ▾/▴ arrow swapped by the open state
 */
export function MdxDetails({ node: _node, className, children, ...props }: MdxDetailsProps) {
  return (
    <details className={cx("group", className)} {...props}>
      {Children.map(children, (child) =>
        isValidElement<{ className?: string; children?: ReactNode }>(child) &&
        child.type === "summary"
          ? cloneElement(
              child,
              { className: cx(SUMMARY, child.props.className) },
              child.props.children,
              <span key="closed" aria-hidden="true" className="group-open:hidden">
                ▾
              </span>,
              <span key="open" aria-hidden="true" className="hidden group-open:inline">
                ▴
              </span>,
            )
          : child,
      )}
    </details>
  );
}
