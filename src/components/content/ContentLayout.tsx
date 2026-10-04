/**
 * @file src/components/content/ContentLayout.tsx
 * @desc A content section's page grid: the nav in a 14rem column from `lg` up, the page beside
 *       it. Port of bb's docs layout grid (`bb.haruhime.moe/src/app/docs/layout.tsx`), generic
 *       over what `nav` is so a docs section and a later blog section share it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<div>` prop (including `ref`), plus the nav slot. */
export type ContentLayoutProps = Omit<ComponentProps<"div">, "children"> & {
  /** Usually a `<ContentNav>`, already rendered by the caller. */
  nav: ReactNode;
  children: ReactNode;
};

/**
 * @function ContentLayout
 * @param props {ContentLayoutProps} the nav slot, the page as children, and native div props
 * @returns {JSX.Element} a one-column grid on phones, a 14rem nav column beside the page from
 *          `lg` up
 */
export function ContentLayout({ nav, children, className, ...props }: ContentLayoutProps) {
  return (
    <div
      className={cx(
        "grid grid-cols-1 gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10",
        className,
      )}
      {...props}
    >
      {nav}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
