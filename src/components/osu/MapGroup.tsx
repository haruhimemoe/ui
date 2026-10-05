/**
 * @file src/components/osu/MapGroup.tsx
 * @desc A bucket of maps: a section named by its heading (title, optional mod pill, count or
 *       "count of target", detail), actions beside it, the maps as list items, dashed empty-slot
 *       rows or one summary row, and "No maps yet." when there is nothing. Rest props reach the
 *       section, so sortable container props pass through. With copyScope (default) its list
 *       is a MapCopyScope. Server-safe (useId works in Server Components).
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { Children, type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { Text } from "../basics/Text.js";
import { MapCopyScope } from "./MapCopyScope.js";
import { ModBadge, type ModBadgeProps } from "./ModBadge.js";

/** Every native section prop except title, plus the group's heading and maps. */
export type MapGroupProps = Omit<ComponentProps<"section">, "title"> & {
  title: ReactNode;
  badge?: { mod: string; color?: ModBadgeProps["color"] } | undefined;
  detail?: ReactNode;
  count?: number | undefined;
  target?: number | undefined;
  headingLevel?: 2 | 3 | 4 | undefined;
  headingProps?: ComponentProps<"h3"> | undefined;
  actions?: ReactNode;
  list?: "ol" | "ul" | undefined;
  children?: ReactNode;
  empty?: ReactNode;
  emptySlots?: number | undefined;
  emptySlotText?: ((n: number) => ReactNode) | undefined;
  emptySlotsAs?: "rows" | "summary" | undefined;
  copyScope?: boolean | undefined;
};

const EMPTY_SLOT = "rounded-[10px] border border-b1 border-dashed px-3 py-2 text-c3 text-sm";

/**
 * @function MapGroup
 * @param props {MapGroupProps} the heading, the maps and the empty-slot options
 * @returns {JSX.Element} the labelled section
 */
export function MapGroup({
  title,
  badge,
  detail,
  count,
  target,
  headingLevel = 3,
  headingProps,
  actions,
  list = "ol",
  children,
  empty = "No maps yet.",
  emptySlots = 0,
  emptySlotText,
  emptySlotsAs = "rows",
  copyScope = true,
  className,
  ...props
}: MapGroupProps) {
  const generated = useId();
  const id = headingProps?.id ?? generated;
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const List = list;
  const items = Children.toArray(children);
  const isEmpty = (count === 0 || (count === undefined && items.length === 0)) && emptySlots <= 0;
  const counted =
    count === undefined ? null : target === undefined ? `(${count})` : `(${count} of ${target})`;
  const slotText =
    emptySlotText ??
    ((n: number) =>
      emptySlotsAs === "summary" ? (n === 1 ? "1 empty slot" : `${n} empty slots`) : "Empty slot");
  const placeholders =
    emptySlots <= 0
      ? []
      : emptySlotsAs === "summary"
        ? [
            <li key="summary" data-empty-slot="" className={EMPTY_SLOT}>
              {slotText(emptySlots)}
            </li>,
          ]
        : Array.from({ length: emptySlots }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
            <li key={`empty-${i}`} data-empty-slot="" className={EMPTY_SLOT}>
              {slotText(i + 1)}
            </li>
          ));
  const body = isEmpty ? (
    <Text tone="muted">{empty}</Text>
  ) : (
    <List className="flex flex-col gap-2">
      {items}
      {placeholders}
    </List>
  );
  return (
    <section aria-labelledby={id} className={cx("flex flex-col gap-2", className)} {...props}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading
          {...headingProps}
          id={id}
          className={cx(
            "flex flex-wrap items-center gap-x-2 font-bold text-c1",
            headingProps?.className,
          )}
        >
          {badge ? <ModBadge aria-hidden="true" mod={badge.mod} color={badge.color} /> : null}
          {title}
          {counted !== null || detail ? (
            <span className="font-normal text-c3 text-sm">
              {counted}
              {counted !== null && detail ? " · " : null}
              {detail}
            </span>
          ) : null}
        </Heading>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {copyScope ? <MapCopyScope>{body}</MapCopyScope> : body}
    </section>
  );
}
