/**
 * @file src/components/filters/RangeSlider.tsx
 * @desc Two-thumb range slider with an editable box at each end (star rating, length, BPM). Two
 *       native range inputs share one track; the thumbs can't cross. With `openEnded`, the top
 *       end at `max` means "no upper limit": it shows "max+" and reports `null`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

"use client";

import {
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useState,
} from "react";
import { cx } from "../../utils/cx.js";

/** A range as `[low, high]`. `high` is `null` for an open top end (no upper limit). */
export type RangeSliderValue = [number, number | null];

/** Every native `<fieldset>` prop except `onChange` and `children`, plus the range. */
export type RangeSliderProps = Omit<ComponentProps<"fieldset">, "onChange" | "children"> & {
  /** Names the group, and the ends as "Minimum <label>" and "Maximum <label>". */
  label: string;
  /** Keep the label for screen readers but hide it on screen (e.g. inside a FilterRow). */
  hideLabel?: boolean | undefined;
  min: number;
  max: number;
  /** Step between values (default 1). Typed values snap to it. */
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
  /** When true, the top end at `max` means "no upper limit" and reports `null`. */
  openEnded?: boolean | undefined;
  /** Accessible name of the low end (default "Minimum <label>"). */
  minLabel?: string | undefined;
  /** Accessible name of the high end (default "Maximum <label>"). */
  maxLabel?: string | undefined;
  /** Disables both thumbs and both boxes. */
  disabled?: boolean | undefined;
};

type End = "low" | "high";

const decimalsOf = (n: number): number => {
  const text = String(n);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
};

const clamp = (n: number, low: number, high: number): number => Math.min(Math.max(n, low), high);

const defaultParse = (text: string): number | null => {
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
};

// Native range inputs, stacked on one track. Only the thumbs take the pointer, so either thumb
// can be dragged wherever they sit. The focus ring goes on the thumb, not the full-width input.
const RANGE =
  "pointer-events-none absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent focus-visible:outline-none disabled:cursor-not-allowed " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:box-border [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-h1 [&::-webkit-slider-thumb]:bg-c1 " +
  "[&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:box-border [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-h1 [&::-moz-range-thumb]:bg-c1 " +
  "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-h1/50 focus-visible:[&::-moz-range-thumb]:ring-4 focus-visible:[&::-moz-range-thumb]:ring-h1/50";

// The field look (border b3 on b6, h1 border on focus), sized for a short value. The group dims
// itself when disabled, so the boxes do not dim twice.
const BOX =
  "w-18 shrink-0 rounded-md border border-b3 bg-b6 px-2 py-1 text-center text-c1 text-sm tabular-nums placeholder:text-c4 focus-visible:border-h1 focus-visible:outline-none disabled:cursor-not-allowed";

/**
 * @function RangeSlider
 * @param props {RangeSliderProps} label, bounds, step, the current range and a change handler,
 *        plus native fieldset props. `onChange`, `format` and `parse` are functions, so render this
 *        from client code.
 * @returns {JSX.Element} a `<fieldset>` (role group) with a low box, two slider thumbs on one
 *          track, and a high box. Arrow keys move a thumb one step, Page Up/Down ten steps,
 *          Home/End as far as it can go. The boxes commit on blur or Enter; Escape puts the value
 *          back.
 */
export function RangeSlider({
  label,
  hideLabel = false,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = String,
  parse = defaultParse,
  openEnded = false,
  minLabel = `Minimum ${label}`,
  maxLabel = `Maximum ${label}`,
  disabled = false,
  className,
  ...props
}: RangeSliderProps) {
  const labelId = useId();
  const [drafts, setDrafts] = useState<Record<End, string | null>>({ low: null, high: null });

  // Normalize what came in (it may come from a URL): inside the bounds, low <= high.
  const low = clamp(value[0], min, max);
  const highOpen = openEnded && (value[1] === null || value[1] >= max);
  const high = value[1] === null ? max : clamp(value[1], low, max);
  const highOut = highOpen ? null : high;

  const decimals = Math.max(decimalsOf(step), decimalsOf(min));
  const snap = (n: number) => Number((min + Math.round((n - min) / step) * step).toFixed(decimals));
  const percent = (n: number) => (max === min ? 0 : ((n - min) / (max - min)) * 100);
  const openText = `${format(max)}+`;
  const text: Record<End, string> = {
    low: format(low),
    high: highOpen ? openText : format(high),
  };

  const commit = (end: End, n: number) => {
    if (end === "low") {
      const next = clamp(snap(n), min, high);
      if (next !== low) onChange([next, highOut]);
      return;
    }
    const snapped = clamp(snap(n), low, max);
    const next = openEnded && (n >= max || snapped >= max) ? null : snapped;
    if (next !== highOut) onChange([low, next]);
  };

  const setDraft = (end: End, draft: string | null) =>
    setDrafts((current) => ({ ...current, [end]: draft }));

  const commitDraft = (end: End) => {
    const draft = drafts[end];
    if (draft === null) return;
    setDraft(end, null);
    const trimmed = draft.trim().replace(/\+$/, "").trim();
    // An empty box means no limit on that end.
    if (trimmed === "") {
      commit(end, end === "low" ? min : max);
      return;
    }
    const n = parse(trimmed);
    if (n !== null && Number.isFinite(n)) commit(end, n);
  };

  const onBoxKeyDown = (end: End) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft(end);
    } else if (event.key === "Escape" && drafts[end] !== null) {
      event.preventDefault();
      setDraft(end, null);
    }
  };

  const onThumbKeyDown = (end: End) => (event: KeyboardEvent<HTMLInputElement>) => {
    const current = end === "low" ? low : high;
    const big = step * 10;
    const moves: Record<string, number> = {
      ArrowLeft: current - step,
      ArrowDown: current - step,
      ArrowRight: current + step,
      ArrowUp: current + step,
      PageDown: current - big,
      PageUp: current + big,
      Home: min,
      End: max,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    commit(end, next);
  };

  const onThumbChange = (end: End) => (event: ChangeEvent<HTMLInputElement>) =>
    commit(end, Number(event.currentTarget.value));

  const box = (end: End): ReactNode => (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-label={end === "low" ? minLabel : maxLabel}
      disabled={disabled}
      value={drafts[end] ?? text[end]}
      onChange={(event) => setDraft(end, event.currentTarget.value)}
      onBlur={() => commitDraft(end)}
      onKeyDown={onBoxKeyDown(end)}
      className={BOX}
    />
  );

  const lowPercent = percent(low);
  const highPercent = highOpen ? 100 : percent(high);

  return (
    <fieldset
      aria-labelledby={labelId}
      disabled={disabled}
      className={cx("flex flex-col gap-2 disabled:opacity-50", className)}
      {...props}
    >
      <span id={labelId} className={hideLabel ? "sr-only" : "font-bold text-c3 text-sm"}>
        {label}
      </span>
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
              className="absolute inset-y-0 rounded-full bg-h1"
              style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
            />
          </div>
          <input
            type="range"
            aria-label={minLabel}
            aria-valuetext={format(low)}
            min={min}
            max={max}
            step={step}
            value={low}
            disabled={disabled}
            onChange={onThumbChange("low")}
            onKeyDown={onThumbKeyDown("low")}
            // Past the middle, the low thumb sits on top, so two thumbs parked at the top end can
            // still be pulled apart.
            className={cx(RANGE, lowPercent > 50 && "z-10")}
          />
          <input
            type="range"
            aria-label={maxLabel}
            aria-valuetext={highOpen ? openText : format(high)}
            min={min}
            max={max}
            step={step}
            value={high}
            disabled={disabled}
            onChange={onThumbChange("high")}
            onKeyDown={onThumbKeyDown("high")}
            className={RANGE}
          />
        </div>
        {box("high")}
      </div>
    </fieldset>
  );
}
