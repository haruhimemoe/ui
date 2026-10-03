/**
 * @file src/components/shell/HeaderMenu.tsx
 * @desc The header's account menu (the pools avatar menu): a button that discloses a small panel
 *       of links and extra controls (a sign-out button). A disclosure, not an ARIA menu: Tab moves
 *       through the links. Escape closes it and puts focus back on the button; a click outside,
 *       a click on a link, or focus leaving it closes it too.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import { type ComponentProps, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cx } from "../../utils/cx.js";
import { AutoLink } from "../basics/AutoLink.js";

/** One link in the panel. */
export type HeaderMenuItem = { href: string; label: ReactNode };

/** Every native `<div>` prop except children, plus the button, the links and extra controls. */
export type HeaderMenuProps = Omit<ComponentProps<"div">, "children"> & {
  /** The button's content, e.g. an avatar and a name. Give an image-only button an aria-label. */
  label: ReactNode;
  /** Links in the panel, top to bottom. */
  items?: readonly HeaderMenuItem[] | undefined;
  /** Shown after the links, e.g. a sign-out button. */
  children?: ReactNode;
  /** Which edge of the button the panel lines up with (default "end", for a header's right side). */
  align?: "start" | "end" | undefined;
  /** Accessible name for the button, when its content isn't text. */
  buttonLabel?: string | undefined;
  /** Classes for the button, merged last. */
  buttonClassName?: string | undefined;
};

const ITEM = "block rounded px-3 py-2 font-bold text-c2 text-sm hover:bg-b4 hover:text-c1";

/**
 * @function HeaderMenu
 * @param props {HeaderMenuProps} the button's content, the links, extra controls as children, the
 *        panel's alignment, and native div props for the wrapper
 * @returns {JSX.Element} the toggle button (aria-expanded, aria-controls) and, while open, the
 *          panel below it
 */
export function HeaderMenu({
  label,
  items = [],
  children,
  align = "end",
  buttonLabel,
  buttonClassName,
  className,
  ...props
}: HeaderMenuProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    // Tab past the last control (or Shift+Tab before the button) closes the panel.
    const onFocusOut = (event: FocusEvent) => {
      if (!wrapper.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
    };
    const box = wrapper.current;
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    box?.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      box?.removeEventListener("focusout", onFocusOut);
    };
  }, [open]);

  return (
    <div ref={wrapper} className={cx("relative", className)} {...props}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={buttonLabel}
        onClick={() => setOpen(!open)}
        className={cx(
          "flex min-h-6 items-center gap-2 font-bold text-c1 text-sm transition-colors hover:text-h1",
          buttonClassName,
        )}
      >
        {label}
      </button>
      <div
        id={panelId}
        hidden={!open}
        className={cx(
          "absolute z-10 mt-2 w-44 flex-col gap-1 rounded-lg border border-b3 bg-b6 p-2",
          open && "flex",
          align === "end" ? "right-0" : "left-0",
        )}
      >
        {items.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <AutoLink href={item.href} className={ITEM} onClick={() => setOpen(false)}>
                  {item.label}
                </AutoLink>
              </li>
            ))}
          </ul>
        ) : null}
        {children}
      </div>
    </div>
  );
}
