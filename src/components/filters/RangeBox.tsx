/**
 * @file src/components/filters/RangeBox.tsx
 * @desc One of RangeSlider's two edit boxes (internal): a short text field on the shared field
 *       look that holds what is being typed, commits it on blur or Enter, and puts the value
 *       back on Escape.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import { type HTMLAttributes, useState } from "react";
import { fieldClasses } from "../forms/fieldStyles.js";

/** The box's name, the value it shows, its keyboard and state, and what to do with typing. */
export type RangeBoxProps = {
  /** The accessible name ("Minimum Star rating"). */
  label: string;
  /** The current value as display text, shown while nothing is being typed. */
  text: string;
  inputMode: HTMLAttributes<HTMLInputElement>["inputMode"];
  disabled: boolean;
  /** Gets the typed text on blur or Enter, when there is any. */
  onCommit: (draft: string) => void;
};

// The field look, sized for a short value. The slider's group dims itself when disabled, so the
// box keeps full opacity instead of dimming twice.
const BOX = fieldClasses(
  "w-18 shrink-0 px-2 py-1 text-center tabular-nums disabled:cursor-not-allowed disabled:opacity-100",
);

/**
 * @function RangeBox
 * @param props {RangeBoxProps} the name, the shown text, the input mode, disabled, and the
 *        commit handler
 * @returns {JSX.Element} a text `<input>` that shows the value, or the typing in progress
 */
export function RangeBox({ label, text, inputMode, disabled, onCommit }: RangeBoxProps) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    setDraft(null);
    onCommit(draft);
  };

  return (
    <input
      type="text"
      inputMode={inputMode}
      autoComplete="off"
      aria-label={label}
      disabled={disabled}
      value={draft ?? text}
      onChange={(event) => setDraft(event.currentTarget.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        } else if (event.key === "Escape" && draft !== null) {
          event.preventDefault();
          setDraft(null);
        }
      }}
      className={BOX}
    />
  );
}
