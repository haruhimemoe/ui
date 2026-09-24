/**
 * @file src/components/shell/SiteHeader.tsx
 * @desc Site header, the osu!-web dark bar: a brand slot on the left, nav links from data, and an
 *       actions slot on the right (an account menu, say). A server component; only the nav list
 *       inside is a client component, to mark the current page.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import type { SiteLinkItem } from "./links.js";
import { NavLinks, type SiteNavAlign } from "./NavLinks.js";

/** Every native `<header>` prop (including `ref`), plus the brand, links and actions. */
export type SiteHeaderProps = Omit<ComponentProps<"header">, "children"> & {
  /** The left side, usually a home link with the site's wordmark. */
  brand: ReactNode;
  /** Nav entries. Internal hrefs use `next/link`, external ones a plain `<a>`. */
  links?: readonly SiteLinkItem[] | undefined;
  /** The nav landmark's accessible name. Default "Main". */
  navLabel?: string | undefined;
  /** "start" puts the nav right after the brand, "center" centers it. Default "start". */
  navAlign?: SiteNavAlign | undefined;
  /** The right side, pushed to the far end. */
  actions?: ReactNode;
};

const ROWS: Record<SiteNavAlign, string> = {
  start: "gap-x-8 gap-y-2",
  center: "gap-4",
};

/**
 * @function SiteHeader
 * @param props {SiteHeaderProps} brand, nav links, nav label and alignment, actions, and native
 *        header props
 * @returns {JSX.Element} the top bar: brand, nav, actions, wrapping onto a second line on phones
 */
export function SiteHeader({
  brand,
  links = [],
  navLabel = "Main",
  navAlign = "start",
  actions,
  className,
  ...props
}: SiteHeaderProps) {
  return (
    <header className={cx("border-b4 border-b bg-b6", className)} {...props}>
      <div
        className={cx("mx-auto flex max-w-5xl flex-wrap items-center px-4 py-3", ROWS[navAlign])}
      >
        {brand}
        {links.length > 0 ? (
          <nav aria-label={navLabel} className={navAlign === "center" ? "flex-1" : undefined}>
            <NavLinks links={links} align={navAlign} />
          </nav>
        ) : null}
        {actions ? <div className="ml-auto">{actions}</div> : null}
      </div>
    </header>
  );
}
