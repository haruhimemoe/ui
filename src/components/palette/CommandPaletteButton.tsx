/**
 * @file src/components/palette/CommandPaletteButton.tsx
 * @desc A header button that opens the mounted CommandPalette: a magnifier, optional text, and
 *       the hotkey hint ("Ctrl K", or "⌘K" once a Mac is detected after mount; hidden under `sm`,
 *       where there's rarely a keyboard and header room is short). Goes anywhere;
 *       it only dispatches the palette event.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Tue Oct 6, 2026
 */

"use client";

import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "../basics/Button.js";
import { kbdClasses } from "../basics/kbdStyles.js";
import { openCommandPalette } from "./paletteEvents.js";
import { isMac } from "./platform.js";

/** Every Button prop except onClick, plus the accessible name. */
export type CommandPaletteButtonProps = Omit<ButtonProps, "onClick"> & {
  /** The accessible name. Default "Open command palette". */
  label?: string | undefined;
};

/**
 * @function CommandPaletteButton
 * @param props {CommandPaletteButtonProps} label, children (text beside the icon) and Button props
 * @returns {JSX.Element} a ghost Button
 */
export function CommandPaletteButton({
  label = "Open command palette",
  children,
  variant = "ghost",
  ...props
}: CommandPaletteButtonProps) {
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(isMac()), []);
  return (
    <Button
      type="button"
      variant={variant}
      // Visible text names the button (WCAG 2.5.3 Label in Name); the label is for icon-only use.
      aria-label={children === undefined || children === null ? label : undefined}
      onClick={() => openCommandPalette()}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-4"
      >
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="m13 13 4 4" strokeLinecap="round" />
      </svg>
      {children}
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a kbd is never focusable; the hint is decoration, so the name stays the visible text */}
      <kbd aria-hidden="true" className={`${kbdClasses} max-sm:hidden`}>
        {mac ? "⌘K" : "Ctrl K"}
      </kbd>
    </Button>
  );
}
