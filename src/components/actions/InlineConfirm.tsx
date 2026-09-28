/**
 * @file src/components/actions/InlineConfirm.tsx
 * @desc A two-step confirm in the page, no dialog: a trigger button, then the question with a
 *       cancel and a confirm button in its place. Focus never falls to the page body: opening
 *       moves it to cancel (the safe choice), and cancelling or Escape puts it back on the
 *       trigger. The open confirm is a fieldset named by the question, so screen readers hear it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cx } from "../../utils/cx.js";
import { Button, type ButtonProps } from "../basics/Button.js";
import type { ButtonVariant } from "../basics/buttonStyles.js";

/**
 * Every native `<div>` prop except children and ref (the wrapper is a `<div>` closed and a
 * `<fieldset>` open), plus the two steps' text and the action.
 */
export type InlineConfirmProps = Omit<ComponentProps<"div">, "children" | "ref"> & {
  /** The first button's text, e.g. "Delete". */
  trigger: ReactNode;
  /** Shown once the trigger is pressed, e.g. "Delete this pack for good?". Names the group. */
  question: ReactNode;
  /** The confirm button's text (default "Confirm"). */
  confirmLabel?: ReactNode;
  /** The cancel button's text (default "Cancel"). */
  cancelLabel?: ReactNode;
  /** The confirm button's text while `onConfirm` runs. Defaults to `confirmLabel`. */
  pendingLabel?: ReactNode;
  /** Runs on confirm. If it throws or rejects, the confirm stays open: show the error yourself. */
  onConfirm: () => void | Promise<void>;
  /** Called when the confirm closes without confirming (Cancel or Escape). */
  onCancel?: (() => void) | undefined;
  /** Props for the trigger button (`aria-label`, `variant`, `disabled`...). Variant "secondary". */
  triggerProps?: Omit<ButtonProps, "onClick" | "children" | "ref"> | undefined;
  /** The confirm button's variant (default "secondary"). Cancel is always "ghost". */
  confirmVariant?: ButtonVariant | undefined;
};

/**
 * @function InlineConfirm
 * @param props {InlineConfirmProps} the trigger, question and button texts, the confirm action,
 *        plus native div props for the wrapper
 * @returns {JSX.Element} the trigger, or the question with cancel and confirm buttons. After a
 *          confirm that resolves, the trigger comes back and takes focus.
 */
export function InlineConfirm({
  trigger,
  question,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  pendingLabel,
  onConfirm,
  onCancel,
  triggerProps,
  confirmVariant = "secondary",
  className,
  ...props
}: InlineConfirmProps) {
  const questionId = useId();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const running = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Whether the next render should move focus: set only by the person's own open or close.
  const moveFocus = useRef(false);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (open ? cancelRef : triggerRef).current?.focus();
  }, [open]);

  const toggle = (next: boolean) => {
    moveFocus.current = true;
    setOpen(next);
  };

  const cancel = () => {
    if (running.current) return;
    toggle(false);
    onCancel?.();
  };

  const confirm = async () => {
    // `pending` reaches the buttons only after a render; two presses must not both run.
    if (running.current) return;
    running.current = true;
    setPending(true);
    try {
      await onConfirm();
      toggle(false);
    } catch {
      // Stay open, with focus where it is, so the person can try again or cancel.
    } finally {
      running.current = false;
      setPending(false);
    }
  };

  const wrapper = cx("flex flex-wrap items-center gap-2", className);

  if (!open) {
    return (
      <div className={wrapper} {...props}>
        <Button variant="secondary" {...triggerProps} ref={triggerRef} onClick={() => toggle(true)}>
          {trigger}
        </Button>
      </div>
    );
  }

  // While the action runs the buttons ignore presses but keep focus (aria-disabled, not
  // disabled, which would drop focus to the body).
  const busy = pending || undefined;
  const onEscape = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    cancel();
  };

  return (
    // A fieldset is a group; named by the question, it is read when focus arrives on cancel.
    <fieldset
      aria-labelledby={questionId}
      className={wrapper}
      {...(props as ComponentProps<"fieldset">)}
    >
      <span id={questionId} className="text-c3 text-sm">
        {question}
      </span>
      <Button
        ref={cancelRef}
        variant="ghost"
        aria-disabled={busy}
        onClick={cancel}
        onKeyDown={onEscape}
      >
        {cancelLabel}
      </Button>
      <Button variant={confirmVariant} aria-disabled={busy} onClick={confirm} onKeyDown={onEscape}>
        {pending && pendingLabel !== undefined ? pendingLabel : confirmLabel}
      </Button>
    </fieldset>
  );
}
