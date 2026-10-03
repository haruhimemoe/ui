/**
 * @file src/components/basics/Disclosure.tsx
 * @desc A button that shows and hides a panel below it (the packs download options): the button
 *       carries aria-expanded and aria-controls, and the closed panel stays in the page, hidden,
 *       so its form fields keep their values. Uncontrolled by default, or controlled with `open`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import { type ComponentProps, type ReactNode, useId, useState } from "react";
import { cx } from "../../utils/cx.js";

/** Every native `<div>` prop for the wrapper, plus the button's text and the panel. */
export type DisclosureProps = Omit<ComponentProps<"div">, "children"> & {
  /** The button's text. It can change with `open` ("Download options" / a summary). */
  summary: ReactNode;
  /** The panel, shown while open. */
  children: ReactNode;
  /** Whether it starts open (default false). Ignored when `open` is set. */
  defaultOpen?: boolean | undefined;
  /** Controls the state from outside; pair it with `onOpenChange`. */
  open?: boolean | undefined;
  /** Called with the new state when the button is pressed. */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Classes for the button, merged last. */
  buttonClassName?: string | undefined;
  /** Classes for the panel, merged last. */
  panelClassName?: string | undefined;
};

/**
 * @function Disclosure
 * @param props {DisclosureProps} the summary, the panel as children, the open state, and native
 *        div props for the wrapper
 * @returns {JSX.Element} the toggle button (with a ▾ / ▴ arrow) and the panel it controls
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  buttonClassName,
  panelClassName,
  className,
  ...props
}: DisclosureProps) {
  const panelId = useId();
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const toggle = () => {
    if (open === undefined) setInner(!isOpen);
    onOpenChange?.(!isOpen);
  };
  return (
    <div className={cx("flex flex-col gap-2", className)} {...props}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
        className={cx(
          "inline-flex min-h-6 items-center gap-1 self-start font-bold text-c2 text-sm transition-colors hover:text-c1",
          buttonClassName,
        )}
      >
        {summary}
        <span aria-hidden="true">{isOpen ? "▴" : "▾"}</span>
      </button>
      <div id={panelId} hidden={!isOpen} className={panelClassName}>
        {children}
      </div>
    </div>
  );
}
