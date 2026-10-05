/**
 * @file src/components/dialogs/Dialog.tsx
 * @desc The modal base: a native <dialog> that follows a controlled `open`. Opening records who
 *       had focus, runs showModal(), focuses `initialFocus` and locks the page's scroll. Closing,
 *       or unmounting while open, releases the lock and hands focus back: to the opener, to the
 *       opener of a dialog it was opened from that has since closed (a palette command), else to
 *       `returnFocus()`. Nothing closes by itself: Escape and a backdrop press ask the owner
 *       through `onDismiss`, and a close the browser made (a back gesture) is reported as
 *       "browser". A backdrop press counts only when it starts and ends on the backdrop.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { type ComponentProps, type RefObject, useEffect, useRef } from "react";
import { cx } from "../../utils/cx.js";
import { DIALOG_BASE, DIALOG_MOTION } from "./dialogStyles.js";
import { lockScroll as lockPageScroll } from "./scrollLock.js";

/** Why the owner is asked to close: Escape, a backdrop press, or the browser already closed it. */
export type DialogDismissReason = "escape" | "backdrop" | "browser";

/** Every native `<dialog>` prop except `open`, `onCancel`, `onClose` and `ref`, plus the controls. */
export type DialogProps = Omit<
  ComponentProps<"dialog">,
  "open" | "onCancel" | "onClose" | "ref"
> & {
  /** Controlled. true runs showModal(), false runs close(). */
  open: boolean;
  /** The person (or the browser) asked to close. The owner decides; nothing closes on its own,
   *  except "browser", where the dialog is already closed and the owner must follow. */
  onDismiss: (reason: DialogDismissReason) => void;
  /** Focused after showModal(). Default: the browser's rule (autofocus, else the first focusable). */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  /** Where focus goes on close when the opener is gone from the page (a deleted row). */
  returnFocus?: (() => HTMLElement | null) | undefined;
  /** false ignores Escape and backdrop (used while an action runs). Default true. */
  dismissible?: boolean | undefined;
  /** The open fade. Default true. */
  motion?: boolean | undefined;
  /** Lock the page's scroll while open. Default true. */
  lockScroll?: boolean | undefined;
};

type Session = { opener: Element | null; host: HTMLDialogElement | null; release: () => void };

// Each dialog's latest opener, kept after it closes: a dialog opened from inside one that has
// since closed hands focus back to that one's opener instead of a hidden element.
const openers = new WeakMap<HTMLDialogElement, Element | null>();

const NO_LOCK = (): void => {};

/** Ends an open session once: releases the lock and puts focus back where it belongs. */
const endSession = (
  session: { current: Session | null },
  returnFocus: (() => HTMLElement | null) | undefined,
): void => {
  const ended = session.current;
  if (!ended) return;
  session.current = null;
  ended.release();
  const target = ended.host && !ended.host.open ? (openers.get(ended.host) ?? null) : ended.opener;
  if (target instanceof HTMLElement && target.isConnected) target.focus();
  else returnFocus?.()?.focus();
};

/**
 * @function Dialog
 * @param props {DialogProps} open, onDismiss, initialFocus, returnFocus, dismissible, motion,
 *        lockScroll, plus native dialog props (name it with aria-label or aria-labelledby)
 * @returns {JSX.Element} the `<dialog>` with its children, which render whether open or not
 */
export function Dialog({
  open,
  onDismiss,
  initialFocus,
  returnFocus,
  dismissible = true,
  motion = true,
  lockScroll = true,
  className,
  onPointerDown,
  onClick,
  children,
  ...props
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const session = useRef<Session | null>(null);
  // A backdrop press: set by a pointerdown on the dialog itself, read by the click after it.
  const armed = useRef(false);
  // The latest props, for the effects and native handlers that outlive a render.
  const latest = useRef({ open, onDismiss, initialFocus, returnFocus, dismissible, lockScroll });
  useEffect(() => {
    latest.current = { open, onDismiss, initialFocus, returnFocus, dismissible, lockScroll };
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const now = latest.current;
    if (open) {
      if (!session.current) {
        const active = document.activeElement;
        const host = active?.closest("dialog") ?? null;
        openers.set(element, active);
        session.current = {
          opener: active,
          host: host === element ? null : host,
          release: now.lockScroll ? lockPageScroll() : NO_LOCK,
        };
      }
      if (!element.open) element.showModal();
      now.initialFocus?.current?.focus();
      return;
    }
    if (element.open) element.close();
    endSession(session, now.returnFocus);
  }, [open]);

  // Unmounted while open (the row it lived in was deleted): close the same way, asking no one.
  useEffect(() => {
    const element = ref.current;
    return () => {
      latest.current = { ...latest.current, open: false };
      if (element?.open) element.close();
      endSession(session, latest.current.returnFocus);
    };
  }, []);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape arrives as the dialog's cancel event; these handlers only read backdrop presses
    <dialog
      ref={ref}
      className={cx(DIALOG_BASE, motion && DIALOG_MOTION, className)}
      {...props}
      onCancel={(event) => {
        event.preventDefault();
        if (latest.current.dismissible) latest.current.onDismiss("escape");
      }}
      onClose={() => {
        // Our own close() fires this too, after `open` went false; only follow the browser's.
        if (!latest.current.open) return;
        endSession(session, latest.current.returnFocus);
        latest.current.onDismiss("browser");
      }}
      onPointerDown={(event) => {
        armed.current = event.target === event.currentTarget;
        onPointerDown?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        const backdrop = armed.current && event.target === event.currentTarget;
        armed.current = false;
        if (backdrop && latest.current.dismissible) latest.current.onDismiss("backdrop");
      }}
    >
      {children}
    </dialog>
  );
}
