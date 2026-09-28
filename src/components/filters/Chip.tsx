/**
 * @file src/components/filters/Chip.tsx
 * @desc Toggle pill (osu! beatmap listing style): a `<button>` with `aria-pressed`, pink when on.
 *       Same look as the mod chips on packs.haruhime.moe. In forced-colors mode a pressed chip
 *       takes the system highlight colors, so on and off still look different. With
 *       `unavailableReason` it is blocked but stays focusable (aria-disabled), and screen readers
 *       hear the reason as its description.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import { type ComponentProps, type ReactNode, useId } from "react";
import { cx } from "../../utils/cx.js";
import { CHIP, CHIP_OFF, CHIP_ON, CHIP_UNAVAILABLE } from "./chipStyles.js";

/** Every native `<button>` prop (including `ref`), plus the pressed state and its handler. */
export type ChipProps = Omit<ComponentProps<"button">, "aria-pressed"> & {
  /** Whether the chip is on. */
  pressed: boolean;
  /** Called with the new state when the chip is clicked (or toggled with Enter or Space). */
  onPressedChange?: ((pressed: boolean) => void) | undefined;
  /**
   * Why the chip can't be pressed right now (EZ with HR picked). The chip is blocked but stays
   * in the tab order (aria-disabled), and the reason is its description (and its title).
   */
  unavailableReason?: ReactNode;
};

/**
 * @function Chip
 * @param props {ChipProps} native button props, plus `pressed` and an optional `onPressedChange`.
 *        A caller's `onClick` runs first; calling `event.preventDefault()` in it skips the toggle.
 *        Callbacks can only be passed from client code.
 * @returns {JSX.Element} a `<button type="button" aria-pressed>` styled as a pill, and the
 *          screen-reader-only reason beside it when it is unavailable
 */
export function Chip({
  pressed,
  onPressedChange,
  unavailableReason,
  onClick,
  className,
  type = "button",
  title,
  "aria-describedby": describedBy,
  ...props
}: ChipProps) {
  const reasonId = useId();
  const blocked = unavailableReason !== undefined && unavailableReason !== null;
  const reasonTitle =
    blocked && typeof unavailableReason === "string" ? unavailableReason : undefined;
  const chip = (
    <button
      type={type}
      aria-pressed={pressed}
      aria-disabled={blocked || undefined}
      // A plain join: these are ids. The reason comes first, then the caller's own.
      aria-describedby={blocked ? [reasonId, describedBy].filter(Boolean).join(" ") : describedBy}
      title={title ?? reasonTitle}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !blocked) onPressedChange?.(!pressed);
      }}
      className={cx(
        CHIP,
        "disabled:cursor-not-allowed disabled:opacity-40",
        pressed ? CHIP_ON : CHIP_OFF,
        blocked ? CHIP_UNAVAILABLE : !pressed && "not-disabled:hover:bg-b2",
        className,
      )}
      {...props}
    />
  );
  if (!blocked) return chip;
  // The reason sits beside the button, not inside it, where it would join the button's name.
  return (
    <>
      {chip}
      <span id={reasonId} className="sr-only">
        {unavailableReason}
      </span>
    </>
  );
}
