/**
 * @file src/components/forms/TypeToConfirm.tsx
 * @desc A confirm for something that can't be undone (delete a pool, hand it to someone else):
 *       a form whose submit button stays off until the expected name is typed exactly, with no
 *       autocomplete or spellcheck in the way. Enter submits once it matches. The pools
 *       delete and transfer forms, as one component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import { type ComponentProps, type FormEvent, type ReactNode, useRef, useState } from "react";
import { cx } from "../../utils/cx.js";
import { Button } from "../basics/Button.js";
import type { ButtonVariant } from "../basics/buttonStyles.js";
import { TextInput } from "./TextInput.js";

/** Every native `<form>` prop except `onSubmit`, plus the name to type and the action. */
export type TypeToConfirmProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  /** The text field's id; its hint and error get `<id>-hint` and `<id>-error`. */
  id: string;
  /** What has to be typed, exactly (spaces around it don't count). */
  expected: string;
  /** The field's label. Default "Type <expected> to confirm". */
  label?: ReactNode;
  /** Help text under the field. */
  hint?: ReactNode;
  /** Error text under the field, e.g. when the action failed. */
  error?: ReactNode;
  /** The submit button's text, e.g. "Delete this pool". */
  submitLabel: ReactNode;
  /** The submit button's text while `onConfirm` runs. Defaults to `submitLabel`. */
  pendingLabel?: ReactNode;
  /** Runs on submit once the text matches. */
  onConfirm: () => void | Promise<void>;
  /** The submit button's look (default "secondary"). */
  variant?: ButtonVariant | undefined;
};

/**
 * @function TypeToConfirm
 * @param props {TypeToConfirmProps} the id, the expected text, the labels, the action, and native
 *        form props; children show above the field (what the action does)
 * @returns {JSX.Element} a `<form>` with the children, the text field and the submit button
 */
export function TypeToConfirm({
  id,
  expected,
  label = `Type ${expected} to confirm`,
  hint,
  error,
  submitLabel,
  pendingLabel,
  onConfirm,
  variant = "secondary",
  className,
  children,
  ...props
}: TypeToConfirmProps) {
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const running = useRef(false);
  const matches = typed.trim() === expected.trim();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!matches || running.current) return;
    running.current = true;
    setPending(true);
    try {
      await onConfirm();
    } catch {
      // The caller says what went wrong through `error`; the form stays as typed for a retry.
    } finally {
      running.current = false;
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className={cx("flex flex-col gap-3", className)} {...props}>
      {children}
      <TextInput
        id={id}
        label={label}
        hint={hint}
        error={error}
        value={typed}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        onChange={(event) => setTyped(event.currentTarget.value)}
      />
      <Button type="submit" variant={variant} className="self-start" disabled={!matches || pending}>
        {pending && pendingLabel !== undefined ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
