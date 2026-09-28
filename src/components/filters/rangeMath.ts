/**
 * @file src/components/filters/rangeMath.ts
 * @desc RangeSlider's math (internal), free of React so it tests on its own: guarded bounds and
 *       step, the incoming range normalized, snapping, the thumbs' keyboard moves, which end a
 *       drag moves, and what a typed box or a thumb move commits.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

/** A range as `[low, high]`. `high` is `null` for an open top end (no upper limit). */
export type RangeSliderValue = [number, number | null];

/** One end of the range. */
export type End = "low" | "high";

/** The bounds and step after guarding: `min <= max`, and a step that is finite and above 0. */
export type RangeBounds = { min: number; max: number; step: number; decimals: number };

/** The range as shown: both ends inside the bounds and in order, and whether the top is open. */
export type RangeState = { low: number; high: number; highOpen: boolean; highOut: number | null };

const decimalsOf = (n: number): number => {
  const text = String(n);
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
};

const clamp = (n: number, low: number, high: number): number => Math.min(Math.max(n, low), high);

/**
 * @function defaultParse
 * @param text {string} a typed value, without a trailing "+"
 * @returns {number | null} the number, reading a comma as the decimal point (comma-locale keypads
 *          type "5,5"), or null when it isn't one
 */
export const defaultParse = (text: string): number | null => {
  const n = Number(text.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/**
 * @function rangeBounds
 * @param min {number} the low bound as passed
 * @param max {number} the high bound as passed
 * @param step {number} the step as passed
 * @returns {RangeBounds} the bounds in order (swapped when `max < min`) and the step, or 1 when
 *          the step is 0, negative or not finite, so snapping never divides by zero
 */
export const rangeBounds = (min: number, max: number, step: number): RangeBounds => {
  const [low, high] = min <= max ? [min, max] : [max, min];
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  return {
    min: low,
    max: high,
    step: safeStep,
    decimals: Math.max(decimalsOf(safeStep), decimalsOf(low)),
  };
};

/**
 * @function normalizeRange
 * @param value {Readonly<RangeSliderValue>} the range as it came in (from a URL, say)
 * @param bounds {RangeBounds} the guarded bounds
 * @param openEnded {boolean} whether a top end at `max` means no upper limit
 * @returns {RangeState} both ends inside the bounds with low <= high. A NaN or infinite end means
 *          no limit on that end, like an empty box.
 */
export const normalizeRange = (
  value: Readonly<RangeSliderValue>,
  { min, max }: RangeBounds,
  openEnded: boolean,
): RangeState => {
  const low = Number.isFinite(value[0]) ? clamp(value[0], min, max) : min;
  const top = value[1] !== null && Number.isFinite(value[1]) ? value[1] : null;
  const highOpen = openEnded && (top === null || top >= max);
  const high = top === null ? max : clamp(top, low, max);
  return { low, high, highOpen, highOut: highOpen ? null : high };
};

/**
 * @function snap
 * @param n {number} a value
 * @param bounds {RangeBounds} the guarded bounds
 * @returns {number} the nearest step from `min`, rounded to the step's decimals (no float noise)
 */
export const snap = (n: number, { min, step, decimals }: RangeBounds): number =>
  Number((min + Math.round((n - min) / step) * step).toFixed(decimals));

/**
 * @function percent
 * @param n {number} a value inside the bounds
 * @param bounds {RangeBounds} the guarded bounds
 * @returns {number} where it sits on the track, 0 to 100 (0 when `min` equals `max`)
 */
export const percent = (n: number, { min, max }: RangeBounds): number =>
  max === min ? 0 : ((n - min) / (max - min)) * 100;

/**
 * @function thumbTarget
 * @param key {string} the key pressed on a thumb
 * @param current {number} that thumb's value
 * @param bounds {RangeBounds} the guarded bounds
 * @returns {number | undefined} where the key sends the thumb (arrows one step, Page Up/Down ten
 *          steps, Home and End to the bounds), or undefined for any other key
 */
export const thumbTarget = (
  key: string,
  current: number,
  { min, max, step }: RangeBounds,
): number | undefined => {
  const moves: Record<string, number> = {
    ArrowLeft: current - step,
    ArrowDown: current - step,
    ArrowRight: current + step,
    ArrowUp: current + step,
    PageDown: current - step * 10,
    PageUp: current + step * 10,
    Home: min,
    End: max,
  };
  return moves[key];
};

/**
 * @function dragEnd
 * @param end {End} the thumb the drag started on
 * @param n {number} the drag's first value
 * @param state {RangeState} the range before the drag
 * @returns {End} the end the drag moves. With both thumbs on one value, only the top thumb can be
 *          grabbed and it can only go one way, so a first move toward the other side moves the
 *          other end.
 */
export const dragEnd = (end: End, n: number, { low, high }: RangeState): End => {
  if (low !== high) return end;
  if (end === "high" && n < low) return "low";
  if (end === "low" && n > high) return "high";
  return end;
};

/**
 * @function nextRange
 * @param end {End} the end that moves
 * @param n {number} where it moves to, before snapping
 * @param state {RangeState} the range now
 * @param bounds {RangeBounds} the guarded bounds
 * @param openEnded {boolean} whether a top end at `max` reports null
 * @returns {RangeSliderValue | null} the new range (snapped, the thumbs uncrossed, an open top
 *          end as null), or null when nothing changed
 */
export const nextRange = (
  end: End,
  n: number,
  state: RangeState,
  bounds: RangeBounds,
  openEnded: boolean,
): RangeSliderValue | null => {
  if (end === "low") {
    const next = clamp(snap(n, bounds), bounds.min, state.high);
    return next === state.low ? null : [next, state.highOut];
  }
  const snapped = clamp(snap(n, bounds), state.low, bounds.max);
  const next = openEnded && (n >= bounds.max || snapped >= bounds.max) ? null : snapped;
  return next === state.highOut ? null : [state.low, next];
};

/**
 * @function readDraft
 * @param draft {string} what was typed in an end's box
 * @param end {End} which box
 * @param bounds {RangeBounds} the guarded bounds
 * @param parse {(text: string) => number | null} the caller's reader
 * @returns {number | null} the value to commit: an empty box is no limit on that end (`min` or
 *          `max`), a trailing "+" is ignored, and text `parse` can't read gives null
 */
export const readDraft = (
  draft: string,
  end: End,
  { min, max }: RangeBounds,
  parse: (text: string) => number | null,
): number | null => {
  const trimmed = draft.trim().replace(/\+$/, "").trim();
  if (trimmed === "") return end === "low" ? min : max;
  const n = parse(trimmed);
  return n !== null && Number.isFinite(n) ? n : null;
};
