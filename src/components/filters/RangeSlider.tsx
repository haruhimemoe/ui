/**
 * @file src/components/filters/RangeSlider.tsx
 * @desc Two-thumb range slider with an editable box at each end (star rating, length, BPM). Two
 *       native range inputs share one track; the thumbs can't cross. With `openEnded`, the top
 *       end at `max` means "no upper limit": it shows "max+" and reports `null`. When both thumbs
 *       sit on one value, a drag moves whichever end can go the way the pointer goes. The math
 *       lives in rangeMath.ts and the boxes in RangeBox.tsx.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Sep 28, 2026
 */

"use client";

import type { ChangeEvent, HTMLAttributes, KeyboardEvent } from "react";
import { useRef } from "react";
import { cx } from "../../utils/cx.js";
import { GroupFrame, type GroupFrameProps } from "./GroupFrame.js";
import { RangeBox } from "./RangeBox.js";
import {
  defaultParse,
  dragEnd,
  type End,
  nextRange,
  normalizeRange,
  percent,
  type RangeSliderValue,
  rangeBounds,
  readDraft,
  thumbTarget,
} from "./rangeMath.js";

export type { RangeSliderValue };

/** Every native `<fieldset>` prop except `onChange`, `children` and `inputMode`, plus the range. */
export type RangeSliderProps = Omit<GroupFrameProps, "onChange" | "children" | "inputMode"> & {
  /** Names the group, and the ends as "Minimum <label>" and "Maximum <label>". */
  label: string;
  /** The low bound. If it is above `max`, the two swap. */
  min: number;
  /** The high bound. */
  max: number;
  /** Step between values (default 1; 0, negative or NaN also mean 1). Typed values snap to it. */
  step?: number | undefined;
  /** The current range. A `null` top end means open (shown at `max`). */
  value: Readonly<RangeSliderValue>;
  /** Called with the new range. The top end is `null` when `openEnded` and it reaches `max`. */
  onChange: (value: RangeSliderValue) => void;
  /** Turns a value into display text for the boxes and screen readers (default `String`). */
  format?: ((value: number) => string) | undefined;
  /**
   * Reads a typed value back (default: a plain number). It gets the text without a trailing
   * "+"; return `null` for text it can't read, and the box goes back to the current value.
   */
  parse?: ((text: string) => number | null) | undefined;
  /**
   * The on-screen keyboard for the boxes. Default "decimal" (digits and a decimal separator), or
   * "text" when `parse` is set, since formats like m:ss need keys the decimal keypad lacks.
   */
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"] | undefined;
  /** When true, the top end at `max` means "no upper limit" and reports `null`. */
  openEnded?: boolean | undefined;
  /** Accessible name of the low end (default "Minimum <label>"). */
  minLabel?: string | undefined;
  /** Accessible name of the high end (default "Maximum <label>"). */
  maxLabel?: string | undefined;
  /** Disables both thumbs and both boxes. */
  disabled?: boolean | undefined;
};

// Native range inputs, stacked on one track. Only the thumbs take the pointer, so either thumb
// can be dragged wherever they sit. The focus ring goes on the thumb, not the full-width input:
// solid h1, so it clears 3:1 on the panel. Forced-colors mode drops box-shadow rings, so the
// input keeps a transparent outline (`outline-hidden`) that mode paints instead.
const RANGE =
  "pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent focus-visible:outline-hidden disabled:cursor-not-allowed " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-h1 [&::-webkit-slider-thumb]:bg-c1 " +
  "[&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-h1 [&::-moz-range-thumb]:bg-c1 " +
  "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-h1 focus-visible:[&::-moz-range-thumb]:ring-4 focus-visible:[&::-moz-range-thumb]:ring-h1";

/**
 * @function RangeSlider
 * @param props {RangeSliderProps} label, bounds, step, the current range and a change handler,
 *        plus native fieldset props. `onChange`, `format` and `parse` are functions, so render this
 *        from client code.
 * @returns {JSX.Element} a `<fieldset>` (role group, or role none with `hideLabel`) with a low
 *          box, two slider thumbs on one track, and a high box. Arrow keys move a thumb one step,
 *          Page Up/Down ten steps, Home/End as far as it can go. The boxes commit on blur or
 *          Enter; Escape puts the value back.
 */
export function RangeSlider({
  label,
  min: rawMin,
  max: rawMax,
  step: rawStep = 1,
  value,
  onChange,
  format = String,
  parse = defaultParse,
  inputMode = parse === defaultParse ? "decimal" : "text",
  openEnded = false,
  minLabel = `Minimum ${label}`,
  maxLabel = `Maximum ${label}`,
  disabled = false,
  className,
  ...props
}: RangeSliderProps) {
  // The pointer drag in progress, and the end it moves (picked on its first change).
  const drag = useRef<{ end: End | null } | null>(null);
  const bounds = rangeBounds(rawMin, rawMax, rawStep);
  const { min, max, step } = bounds;
  const state = normalizeRange(value, bounds, openEnded);
  const { low, high, highOpen } = state;
  const openText = `${format(max)}+`;

  const commit = (end: End, n: number) => {
    const next = nextRange(end, n, state, bounds, openEnded);
    if (next) onChange(next);
  };

  const commitDraft = (end: End) => (draft: string) => {
    const n = readDraft(draft, end, bounds, parse);
    if (n !== null) commit(end, n);
  };

  const onThumbKeyDown = (end: End) => (event: KeyboardEvent<HTMLInputElement>) => {
    const next = thumbTarget(event.key, end === "low" ? low : high, bounds);
    if (next === undefined) return;
    event.preventDefault();
    commit(end, next);
  };

  const onThumbPointerDown = () => {
    drag.current = { end: null };
    const done = () => {
      drag.current = null;
      window.removeEventListener("pointerup", done);
      window.removeEventListener("pointercancel", done);
    };
    window.addEventListener("pointerup", done);
    window.addEventListener("pointercancel", done);
  };

  // A drag keeps the end its first move picked until the pointer lifts. Changes without a
  // pointer (assistive tech stepping a slider) always move their own end.
  const onThumbChange = (end: End) => (event: ChangeEvent<HTMLInputElement>) => {
    const n = Number(event.currentTarget.value);
    const gesture = drag.current;
    if (gesture && gesture.end === null) gesture.end = dragEnd(end, n, state);
    commit(gesture?.end ?? end, n);
  };

  const thumb = (end: End) => ({
    type: "range" as const,
    "aria-label": end === "low" ? minLabel : maxLabel,
    "aria-valuetext": end === "low" ? format(low) : highOpen ? openText : format(high),
    min,
    max,
    step,
    value: end === "low" ? low : high,
    disabled,
    onChange: onThumbChange(end),
    onKeyDown: onThumbKeyDown(end),
    onPointerDown: onThumbPointerDown,
  });

  const box = (end: End) => (
    <RangeBox
      label={end === "low" ? minLabel : maxLabel}
      text={end === "low" ? format(low) : highOpen ? openText : format(high)}
      inputMode={inputMode}
      disabled={disabled}
      onCommit={commitDraft(end)}
    />
  );

  const lowPercent = percent(low, bounds);
  const highPercent = highOpen ? 100 : percent(high, bounds);

  return (
    <GroupFrame
      label={label}
      disabled={disabled}
      className={cx("disabled:opacity-50", className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        {box("low")}
        <div className="relative h-5 min-w-0 flex-1">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-b3"
          />
          {/* Inset by half a thumb, so the fill ends at the thumb centers. */}
          <div aria-hidden="true" className="absolute inset-x-2 top-1/2 h-1.5 -translate-y-1/2">
            <div
              data-range-fill=""
              className="absolute inset-y-0 rounded-full bg-h1 forced-colors:bg-[Highlight]"
              style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
            />
          </div>
          {/* Past the middle, the low thumb sits on top, so two thumbs parked at the top end can
              still be pulled apart. */}
          <input {...thumb("low")} className={cx(RANGE, lowPercent > 50 && "z-10")} />
          <input {...thumb("high")} className={RANGE} />
        </div>
        {box("high")}
      </div>
    </GroupFrame>
  );
}
