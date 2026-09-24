/**
 * @file src/components/filters/Chip.tsx
 * @desc Toggle pill (osu! beatmap listing style): a `<button>` with `aria-pressed`, pink when on.
 *       Same look as the mod chips on packs.haruhime.moe. In forced-colors mode a pressed chip
 *       takes the system highlight colors, so on and off still look different.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

"use client";

import type { ComponentProps } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<button>` prop (including `ref`), plus the pressed state and its handler. */
export type ChipProps = Omit<ComponentProps<"button">, "aria-pressed"> & {
  /** Whether the chip is on. */
  pressed: boolean;
  /** Called with the new state when the chip is clicked (or toggled with Enter or Space). */
  onPressedChange?: ((pressed: boolean) => void) | undefined;
};

const BASE =
  "rounded-full px-2.5 py-0.5 font-bold text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const PRESSED = "bg-h1 text-b6 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]";
const UNPRESSED = "bg-b3 text-c2 not-disabled:hover:bg-b2";

/**
 * @function Chip
 * @param props {ChipProps} native button props, plus `pressed` and an optional `onPressedChange`.
 *        A caller's `onClick` runs first; calling `event.preventDefault()` in it skips the toggle.
 *        Callbacks can only be passed from client code.
 * @returns {JSX.Element} a `<button type="button" aria-pressed>` styled as a pill
 */
export function Chip({
  pressed,
  onPressedChange,
  onClick,
  className,
  type = "button",
  ...props
}: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={pressed}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onPressedChange?.(!pressed);
      }}
      className={cx(BASE, pressed ? PRESSED : UNPRESSED, className)}
      {...props}
    />
  );
}
