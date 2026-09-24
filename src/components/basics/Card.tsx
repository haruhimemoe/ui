/**
 * @file src/components/basics/Card.tsx
 * @desc osu!-web panel: rounded b4 surface, optional h2 title that labels the region. Server-safe
 *       (useId works in Server Components).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<section>` prop (including `ref`), with `title` rendered as the card's h2. */
export type CardProps = Omit<ComponentProps<"section">, "title"> & {
  title?: ReactNode | undefined;
};

/**
 * @function Card
 * @param props {CardProps} an optional title that labels the region, plus native section props
 * @returns {JSX.Element} a rounded panel, labelled by its title when one is given
 */
export function Card({ title, className, children, ...props }: CardProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cx("rounded-[10px] bg-b4 p-5 text-c2", className)}
      {...props}
    >
      {title ? (
        <h2 id={headingId} className="mb-2 font-bold text-c1 text-lg">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
