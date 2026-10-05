/**
 * @file src/components/sortable/SortableMoveButtons.tsx
 * @desc Up and Down for one sortable item, on the hook's button path: the same onMove (via
 *       "button"), the same announcements, and focus kept on the pressed button, or moved to
 *       the other one when the item reaches an end. Off at the first or last place and while a
 *       move is pending. WCAG 2.2 2.5.7 wants this single-pointer way to do what a drag does.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";
import { Button } from "../basics/Button.js";
import type { ButtonVariant } from "../basics/buttonStyles.js";
import type { Sortable } from "./sortableTypes.js";

/** Native span props for the wrapper, the hook, the item and the buttons' words. */
export type SortableMoveButtonsProps = Omit<ComponentProps<"span">, "children"> & {
  sortable: Sortable;
  id: string;
  /** The item's name in "Move {label} up". */
  label: string;
  /** Default "Up". */
  upText?: string | undefined;
  /** Default "Down". */
  downText?: string | undefined;
  /** Default "ghost". */
  variant?: ButtonVariant | undefined;
};

/**
 * @function SortableMoveButtons
 * @param props {SortableMoveButtonsProps} the hook, the item, its label and the buttons' words
 * @returns {JSX.Element} the two buttons in a span
 */
export function SortableMoveButtons({
  sortable,
  id,
  label,
  upText = "Up",
  downText = "Down",
  variant = "ghost",
  className,
  ...props
}: SortableMoveButtonsProps) {
  return (
    <span {...props} className={cx("inline-flex flex-wrap items-center gap-1", className)}>
      <Button
        variant={variant}
        data-sortable-move="up"
        data-sortable-for={id}
        aria-label={`Move ${label} up`}
        disabled={!sortable.canMoveBy(id, -1)}
        onClick={() => sortable.moveBy(id, -1)}
      >
        {upText}
      </Button>
      <Button
        variant={variant}
        data-sortable-move="down"
        data-sortable-for={id}
        aria-label={`Move ${label} down`}
        disabled={!sortable.canMoveBy(id, 1)}
        onClick={() => sortable.moveBy(id, 1)}
      >
        {downText}
      </Button>
    </span>
  );
}
