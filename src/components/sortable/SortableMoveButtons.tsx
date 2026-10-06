/**
 * @file src/components/sortable/SortableMoveButtons.tsx
 * @desc Up and Down for one sortable item, on the hook's button path: the same onMove (via
 *       "button"), the same announcements, and focus kept on the pressed button, or moved to
 *       the other one when the item reaches an end. Off at the first or last place and while a
 *       move is pending. WCAG 2.2 2.5.7 wants this single-pointer way to do what a drag does.
 *       Default content is two chevron icons (aria-hidden; the accessible name stays on the
 *       button); `upText`/`downText` swap in words instead, and `title` always mirrors the
 *       aria-label so mouse users get the same text as a tooltip.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { Button } from "../basics/Button.js";
import type { ButtonSize, ButtonVariant } from "../basics/buttonStyles.js";
import { ChevronDownIcon } from "../icons/ChevronDownIcon.js";
import { ChevronUpIcon } from "../icons/ChevronUpIcon.js";
import type { Sortable } from "./sortableTypes.js";

/** Native span props for the wrapper, the hook, the item and the buttons' words. */
export type SortableMoveButtonsProps = Omit<ComponentProps<"span">, "children"> & {
  sortable: Sortable;
  id: string;
  /** The item's name in "Move {label} up". */
  label: string;
  /** Default a chevron icon; set to swap in words instead. */
  upText?: string | undefined;
  /** Default a chevron icon; set to swap in words instead. */
  downText?: string | undefined;
  /** Default "ghost". */
  variant?: ButtonVariant | undefined;
  /** Default "sm" (icon square) when showing chevrons, "md" when `upText`/`downText` are set. */
  size?: ButtonSize | undefined;
  /** Stack the two buttons in a column instead of a row. Default "horizontal". */
  orientation?: "horizontal" | "vertical" | undefined;
};

/**
 * @function SortableMoveButtons
 * @param props {SortableMoveButtonsProps} the hook, the item, its label, the buttons' words and
 *        layout
 * @returns {JSX.Element} the two buttons in a span
 */
export function SortableMoveButtons({
  sortable,
  id,
  label,
  upText,
  downText,
  variant = "ghost",
  size,
  orientation = "horizontal",
  className,
  ...props
}: SortableMoveButtonsProps) {
  const resolvedSize = size ?? (upText || downText ? "md" : "sm");
  const upLabel = `Move ${label} up`;
  const downLabel = `Move ${label} down`;
  return (
    <span
      {...props}
      className={cx(
        "inline-flex items-center gap-1",
        orientation === "vertical" ? "flex-col" : "flex-wrap",
        className,
      )}
    >
      <Button
        variant={variant}
        size={resolvedSize}
        data-sortable-move="up"
        data-sortable-for={id}
        aria-label={upLabel}
        title={upLabel}
        disabled={!sortable.canMoveBy(id, -1)}
        onClick={() => sortable.moveBy(id, -1)}
      >
        {upText ?? <ChevronUpIcon />}
      </Button>
      <Button
        variant={variant}
        size={resolvedSize}
        data-sortable-move="down"
        data-sortable-for={id}
        aria-label={downLabel}
        title={downLabel}
        disabled={!sortable.canMoveBy(id, 1)}
        onClick={() => sortable.moveBy(id, 1)}
      >
        {downText ?? <ChevronDownIcon />}
      </Button>
    </span>
  );
}
