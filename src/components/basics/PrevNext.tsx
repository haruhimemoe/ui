/**
 * @file src/components/basics/PrevNext.tsx
 * @desc Previous and next links at the end of a page in a series (docs tags, guides): a named
 *       nav over a b3 rule, each link a small "Previous ←" / "Next →" line over the bold title,
 *       named "Previous: <title>". Next sits at the end on its own. Neither link: nothing.
 *       Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { TextLink } from "./TextLink.js";

/** Where a link goes and the page title it shows. */
export type PrevNextLink = { href: string; title: ReactNode };

/** Every native `<nav>` prop, plus the nav's name and the two links. */
export type PrevNextProps = Omit<ComponentProps<"nav">, "children"> & {
  /** The nav's name: "More tags", "More guides". */
  label: string;
  prev?: PrevNextLink | undefined;
  next?: PrevNextLink | undefined;
  prevText?: string | undefined;
  nextText?: string | undefined;
};

function Item({ link, text, end }: { link: PrevNextLink; text: string; end: boolean }) {
  return (
    <TextLink
      href={link.href}
      variant="plain"
      className={cx(
        "wrap-anywhere flex min-w-0 flex-col gap-0.5",
        end && "sm:ml-auto sm:text-right",
      )}
    >
      <span className="font-normal text-c4 text-xs">
        {end ? (
          <>
            {text} <span aria-hidden="true">→</span>
          </>
        ) : (
          <>
            <span aria-hidden="true">←</span> {text}
          </>
        )}
      </span>
      {/* The colon is its own sr-only span and the space a bare text node: the accessible-name
          algorithm trims each child element's text, so ": " inside a span would read
          "Previous:[b] Bold". A whitespace-only text node in a flex box renders nothing. */}
      <span className="sr-only">:</span> <span className="font-bold text-c1">{link.title}</span>
    </TextLink>
  );
}

/**
 * @function PrevNext
 * @param props {PrevNextProps} label, prev, next, prevText (default "Previous"), nextText
 *        (default "Next"), plus native nav props
 * @returns {JSX.Element | null} the nav, or null with neither link
 */
export function PrevNext({
  label,
  prev,
  next,
  prevText = "Previous",
  nextText = "Next",
  className,
  ...props
}: PrevNextProps) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label={label}
      className={cx(
        "flex flex-col gap-3 border-b3 border-t pt-4 contrast-more:border-c4 sm:flex-row sm:justify-between",
        className,
      )}
      {...props}
    >
      {prev ? <Item link={prev} text={prevText} end={false} /> : null}
      {next ? <Item link={next} text={nextText} end /> : null}
    </nav>
  );
}
