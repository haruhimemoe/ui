/**
 * @file src/components/basics/Card.tsx
 * @desc osu!-web panel: rounded b4 surface, optional title (an h2 by default) that labels the
 *       region. Server-safe (useId works in Server Components).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Thu Sep 24, 2026
 */

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<section>` prop (including `ref`), with `title` rendered as the card's heading. */
export type CardProps = Omit<ComponentProps<"section">, "title"> & {
  title?: ReactNode | undefined;
  /** Heading level for the title (default 2). Use 3 or 4 for a card under another heading. */
  headingLevel?: 2 | 3 | 4 | undefined;
};

/**
 * @function Card
 * @param props {CardProps} an optional title that labels the region, its heading level (default
 *        2), plus native section props
 * @returns {JSX.Element} a rounded panel, labelled by its title when one is given
 */
export function Card({ title, headingLevel = 2, className, children, ...props }: CardProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as const;
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cx("rounded-[10px] bg-b4 p-5 text-c2", className)}
      {...props}
    >
      {title ? (
        <Heading id={headingId} className="mb-2 font-bold text-c1 text-lg">
          {title}
        </Heading>
      ) : null}
      {children}
    </section>
  );
}
