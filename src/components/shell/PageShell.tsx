/**
 * @file src/components/shell/PageShell.tsx
 * @desc Page frame: a skip link, the header, the main landmark and the footer, with the footer
 *       held to the bottom on short pages.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<div>` prop (including `ref`), plus the header and footer slots. */
export type PageShellProps = ComponentProps<"div"> & {
  /** Rendered above main, usually a `<SiteHeader>`. */
  header?: ReactNode;
  /** Rendered below main, usually a `<SiteFooter>`. */
  footer?: ReactNode;
  /** The skip link's text. Default "Skip to content". */
  skipLabel?: string | undefined;
  /** The main landmark's id, which the skip link targets. Default "main". */
  mainId?: string | undefined;
  /** Extra classes for the main landmark, appended last. */
  mainClassName?: string | undefined;
};

/**
 * @function PageShell
 * @param props {PageShellProps} the page as children, header and footer slots, skip link text,
 *        main id and classes, and native div props
 * @returns {JSX.Element} the page between the header and footer, behind a skip link to main
 */
export function PageShell({
  header,
  footer,
  skipLabel = "Skip to content",
  mainId = "main",
  mainClassName,
  className,
  children,
  ...props
}: PageShellProps) {
  return (
    <div className={cx("flex min-h-dvh flex-col", className)} {...props}>
      <a
        href={`#${mainId}`}
        className="sr-only rounded-full bg-h2 px-4 py-2 font-bold text-c1 focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        {skipLabel}
      </a>
      {header}
      <main id={mainId} className={cx("mx-auto w-full max-w-5xl flex-1 px-4 py-10", mainClassName)}>
        {children}
      </main>
      {footer}
    </div>
  );
}
