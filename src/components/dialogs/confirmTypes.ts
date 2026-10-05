/**
 * @file src/components/dialogs/confirmTypes.ts
 * @desc ConfirmDialog's types and small text helpers, split out so ConfirmDialog.tsx stays under
 *       200 lines. Server-safe, no directive. Internal.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ReactNode } from "react";
import type { ButtonProps } from "../basics/Button.js";

/** The confirm button's look: `default` is primary, `destructive` the danger variant. */
export type ConfirmTone = "default" | "destructive";

/** ConfirmDialog's props: the texts, the action, and a trigger or a controlled `open`. */
export type ConfirmDialogProps = {
  /** Heading; names the dialog (aria-labelledby). "Delete this pack?" */
  title: ReactNode;
  /** What happens, under the title; describes the dialog (aria-describedby). */
  description?: ReactNode;
  /** Extra content between the description and the buttons (a list of what goes). */
  children?: ReactNode;
  /** The confirm button's text (default "Confirm"). */
  confirmLabel?: ReactNode;
  /** The cancel button's text (default "Cancel"). */
  cancelLabel?: ReactNode;
  /** The confirm button's text while `onConfirm` runs. Defaults to `confirmLabel`. */
  pendingLabel?: ReactNode;
  /** "destructive" gives the confirm button the `danger` variant. Default "default" (primary). */
  tone?: ConfirmTone;
  /** Resolve: the dialog closes. Throw or reject: it stays open and shows `failedMessage`. */
  onConfirm: () => void | Promise<void>;
  /** Shown on failure; a function gets the thrown value. Default "Something went wrong. Try again." */
  failedMessage?: ReactNode | ((error: unknown) => ReactNode);
  /** Type-to-confirm: the confirm button stays off until this is typed (TypeToConfirm's rule). */
  typeToConfirm?: string | { expected: string; label?: ReactNode; hint?: ReactNode };
  /** Called when it closes without confirming (Cancel, Escape, backdrop, browser). */
  onCancel?: () => void;
  /** Where focus goes when the trigger is gone after a confirm (a deleted row). */
  returnFocus?: () => HTMLElement | null;
} & (
  | {
      /** Uncontrolled: a Button that opens it. */
      trigger: ReactNode;
      triggerProps?: Omit<ButtonProps, "onClick" | "children" | "ref">;
      open?: never;
      onOpenChange?: never;
    }
  | {
      /** Controlled: for palette commands and rows that own the state. */
      open: boolean;
      onOpenChange: (open: boolean) => void;
      trigger?: never;
      triggerProps?: never;
    }
);

/** The default failure message. */
export const FAILED = "Something went wrong. Try again.";

/** A normalized `typeToConfirm`: the expected text, plus an optional label and hint. */
export type TypeSpec = { expected: string; label?: ReactNode; hint?: ReactNode };

/**
 * @function typeSpecOf
 * @param value {ConfirmDialogProps["typeToConfirm"]} the prop as given (a string, an object, or
 *        undefined)
 * @returns {TypeSpec | null} the normalized spec, or null when type-to-confirm isn't used
 */
export const typeSpecOf = (value: ConfirmDialogProps["typeToConfirm"]): TypeSpec | null =>
  value === undefined ? null : typeof value === "string" ? { expected: value } : value;
