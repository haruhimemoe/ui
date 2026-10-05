/**
 * @file src/components/basics/CardGrid.tsx
 * @desc The card grid: a list, one column on phones and two or three from sm, that wraps each
 *       child in its own flex `<li>` so cards in one row match height. Cards render no `<li>` of
 *       their own. Arrays and fragments are flattened, null and false dropped. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { Children, type ComponentProps, Fragment, isValidElement, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<ul>` prop, plus the cards, the column count, the gap and the list element. */
export type CardGridProps = Omit<ComponentProps<"ul">, "children"> & {
  children: ReactNode;
  /** 2 (default): two from sm. 3: two from sm, three from lg. */
  columns?: 2 | 3 | undefined;
  /** "md" (default): gap-4, gap-5 from sm. "sm": gap-2.5. */
  gap?: "sm" | "md" | undefined;
  /** "ul" (default) or "ol". */
  as?: "ul" | "ol" | undefined;
};

const COLUMNS = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3" } as const;
const GAPS = { sm: "gap-2.5", md: "gap-4 sm:gap-5" } as const;

/** Each real child with a key unique in the grid; fragments open up, null and false drop out. */
const flatten = (children: ReactNode, prefix = ""): { key: string; node: ReactNode }[] =>
  Children.toArray(children).flatMap((child, index) => {
    const key = `${prefix}${isValidElement(child) && child.key !== null ? child.key : index}`;
    return isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flatten(child.props.children, `${key}/`)
      : [{ key, node: child }];
  });

/**
 * @function CardGrid
 * @param props {CardGridProps} the cards, columns (default 2), gap (default "md"), list element
 *        (default "ul"), plus native list props
 * @returns {JSX.Element} the list, one `<li>` per card
 */
export function CardGrid({
  children,
  columns = 2,
  gap = "md",
  as = "ul",
  className,
  ...props
}: CardGridProps) {
  const listClassName = cx("grid grid-cols-1", COLUMNS[columns], GAPS[gap], className);
  const items = flatten(children).map(({ key, node }) => (
    <li key={key} className="flex [&>*]:w-full">
      {node}
    </li>
  ));
  if (as === "ol") {
    return (
      <ol className={listClassName} {...(props as ComponentProps<"ol">)}>
        {items}
      </ol>
    );
  }
  return (
    <ul className={listClassName} {...props}>
      {items}
    </ul>
  );
}
