/**
 * @file src/components/dialogs/ConfirmDialog.tsx
 * @desc A confirm in a modal alertdialog, on Dialog: a title that names it, a description, extra
 *       content, and Cancel and Confirm in a form (Enter submits). Opens from its own trigger
 *       button or a controlled `open`. Focus starts on Cancel, or on the type field when
 *       `typeToConfirm` is set, whose Confirm stays aria-disabled until the text matches. While
 *       `onConfirm` runs, one run at a time, both buttons keep focus but ignore presses and
 *       Escape and the backdrop do nothing. Resolve closes it; a throw keeps it open with the
 *       failure in an alert. Content renders only while open, so each open starts fresh.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Button } from "../basics/Button.js";
import { TextInput } from "../forms/TextInput.js";
import { typedMatches } from "../forms/typedMatches.js";
import { type ConfirmDialogProps, FAILED, typeSpecOf } from "./confirmTypes.js";
import { Dialog, type DialogDismissReason } from "./Dialog.js";
import { CONFIRM_BUTTONS, CONFIRM_ERROR, DIALOG_FRAME, PANEL_BASE } from "./dialogStyles.js";

export type { ConfirmDialogProps, ConfirmTone } from "./confirmTypes.js";

/**
 * @function ConfirmDialog
 * @param props {ConfirmDialogProps} title, description, labels, tone, the action and its failure
 *        message, an optional name to type, and a trigger or a controlled open
 * @returns {JSX.Element} the trigger (uncontrolled) and the dialog
 */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    title,
    description,
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    pendingLabel,
    tone = "default",
    onConfirm,
    failedMessage = FAILED,
    onCancel,
    returnFocus,
  } = props;
  const spec = typeSpecOf(props.typeToConfirm);
  const [ownOpen, setOwnOpen] = useState(false);
  const open = props.open ?? ownOpen;
  const [typed, setTyped] = useState("");
  const [failure, setFailure] = useState<ReactNode>(null);
  const [pending, setPending] = useState(false);
  // `pending` reaches the buttons only after a render; two presses must not both run.
  const running = useRef(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const whyId = `${id}-why`;
  const matches = spec === null || typedMatches(typed, spec.expected);

  // Content renders only while open, so clearing on close means every open starts fresh.
  useEffect(() => {
    if (open) return;
    setTyped("");
    setFailure(null);
  }, [open]);

  const setOpen = (next: boolean) => {
    if (props.onOpenChange) props.onOpenChange(next);
    else setOwnOpen(next);
  };

  const cancel = () => {
    if (running.current) return;
    setOpen(false);
    onCancel?.();
  };

  const dismiss = (reason: DialogDismissReason) => {
    // The browser already closed it: follow, but a confirm still running wasn't cancelled.
    if (reason === "browser" && running.current) {
      setOpen(false);
      return;
    }
    cancel();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!matches || running.current) return;
    running.current = true;
    setPending(true);
    setFailure(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      setFailure(typeof failedMessage === "function" ? failedMessage(error) : failedMessage);
    } finally {
      running.current = false;
      setPending(false);
    }
  };

  // Pending buttons ignore presses but keep focus (aria-disabled, not disabled).
  const busy = pending || undefined;

  return (
    <>
      {props.trigger !== undefined ? (
        <Button variant="secondary" {...props.triggerProps} onClick={() => setOpen(true)}>
          {props.trigger}
        </Button>
      ) : null}
      <Dialog
        open={open}
        onDismiss={dismiss}
        role="alertdialog"
        aria-labelledby={open ? titleId : undefined}
        aria-describedby={open && description !== undefined ? descriptionId : undefined}
        initialFocus={spec ? fieldRef : cancelRef}
        returnFocus={returnFocus}
        dismissible={!pending}
        className={DIALOG_FRAME}
      >
        {open ? (
          <div className={PANEL_BASE} aria-busy={busy}>
            <h2 id={titleId} className="font-bold text-c1 text-lg">
              {title}
            </h2>
            {description !== undefined ? (
              <p id={descriptionId} className="mt-2 text-c2 text-sm">
                {description}
              </p>
            ) : null}
            <form noValidate onSubmit={submit} className="mt-4 flex flex-col gap-4">
              {children}
              {spec ? (
                <TextInput
                  ref={fieldRef}
                  id={`${id}-type`}
                  label={<span id={whyId}>{spec.label ?? `Type ${spec.expected} to confirm`}</span>}
                  hint={spec.hint}
                  value={typed}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onChange={(event) => setTyped(event.currentTarget.value)}
                />
              ) : null}
              {failure !== null && failure !== undefined ? (
                <p role="alert" className={CONFIRM_ERROR}>
                  {failure}
                </p>
              ) : null}
              <div className={CONFIRM_BUTTONS}>
                <Button
                  ref={cancelRef}
                  variant="ghost"
                  className="w-full sm:w-fit"
                  aria-disabled={busy}
                  onClick={cancel}
                >
                  {cancelLabel}
                </Button>
                <Button
                  type="submit"
                  variant={tone === "destructive" ? "danger" : "primary"}
                  className="w-full sm:w-fit"
                  aria-disabled={!matches || busy || undefined}
                  aria-describedby={matches ? undefined : whyId}
                >
                  {pending && pendingLabel !== undefined ? pendingLabel : confirmLabel}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
