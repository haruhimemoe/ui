/**
 * @file src/components/basics/LinkCard.tsx
 * @desc A card that is one link: the surface plus a CardLink cover (the `title` shorthand, or a
 *       CardLink the caller places in its own heading), with every other link, button and field
 *       inside lifted above the cover. `media` renders first and full-bleed. A div, not a
 *       landmark: a grid of them adds no regions. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { CardLink } from "./CardLink.js";
import { CARD_HEADING, type HeadingLevel } from "./cardStyles.js";
import { CARD_LINK_LIFT, SURFACE, SURFACE_PADDING, type SurfacePadding } from "./surfaceStyles.js";

type LinkCardBase = Omit<ComponentProps<"div">, "title"> & {
  /** The shorthand title's heading level (default 3: cards sit under a section heading). */
  headingLevel?: HeadingLevel | undefined;
  /** Full-bleed slot above the body (a banner image). The body keeps the padding. */
  media?: ReactNode | undefined;
  /** The body's padding (default "lg", like Card). */
  padding?: SurfacePadding | undefined;
};

/** Every native `<div>` prop, plus the shorthand `title` and `href`, which come together or not at all. */
export type LinkCardProps = LinkCardBase &
  ({ title: ReactNode; href: string } | { title?: never; href?: never });

const ROOT =
  "relative isolate flex flex-col overflow-hidden transition-colors hover:bg-b3 focus-within:bg-b3";

/**
 * @function LinkCard
 * @param props {LinkCardProps} an optional title and href (rendered as
 *        `<Heading><CardLink href>{title}</CardLink></Heading>` first), heading level, media,
 *        padding, plus native div props
 * @returns {JSX.Element} the card
 */
export function LinkCard({
  title,
  href,
  headingLevel = 3,
  media,
  padding = "lg",
  className,
  children,
  ...props
}: LinkCardProps) {
  const Heading = `h${headingLevel}` as const;
  const heading =
    title !== undefined && href !== undefined ? (
      <Heading className={CARD_HEADING}>
        <CardLink href={href}>{title}</CardLink>
      </Heading>
    ) : null;
  return (
    <div
      className={cx(
        SURFACE,
        ROOT,
        CARD_LINK_LIFT,
        media ? undefined : cx("gap-4", SURFACE_PADDING[padding]),
        className,
      )}
      {...props}
    >
      {media ? (
        <>
          {media}
          <div className={cx("flex flex-col gap-4", SURFACE_PADDING[padding])}>
            {heading}
            {children}
          </div>
        </>
      ) : (
        <>
          {heading}
          {children}
        </>
      )}
    </div>
  );
}
