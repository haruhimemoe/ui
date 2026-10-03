/**
 * @file src/components/palette/store.ts
 * @desc The palette's state and reducer, pure: open or closed, a stack of page frames (each with
 *       its own query, active row and provider results, so popping back restores where you
 *       were), and the argument prompt in progress. Every key the palette handles is an action
 *       here, so the rules test without a DOM. CommandPalette owns it through useReducer.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { Command, Page } from "./types.js";

/** One provider's rows on a frame and where its search is. */
export type ProviderResult = { state: "loading" | "done" | "error"; rows: readonly Command[] };

/** One page on the stack. */
export type Frame = {
  page: Page;
  query: string;
  active: number;
  providers: Record<string, ProviderResult>;
};

/** The argument prompt in progress. */
export type ArgState = {
  command: Command;
  index: number;
  values: Record<string, string>;
  query: string;
  active: number;
  error?: string | undefined;
};

export type PaletteState = { open: boolean; stack: Frame[]; arg: ArgState | null };

export type PaletteAction =
  | { type: "open"; root: Page; page?: Page | undefined }
  | { type: "close" }
  | { type: "query"; value: string }
  | { type: "active"; index: number; count: number }
  | { type: "move"; delta: Delta; count: number }
  | { type: "push"; page: Page }
  | { type: "pop" }
  | { type: "beginArgs"; command: Command }
  | { type: "argAccept"; value: string }
  | { type: "argError"; message: string }
  | { type: "provided"; depth: number; providerId: string; result: ProviderResult };

const frame = (page: Page): Frame => ({ page, query: "", active: 0, providers: {} });

/**
 * @function initialState
 * @returns {PaletteState} closed, empty
 */
export const initialState = (): PaletteState => ({ open: false, stack: [], arg: null });

/**
 * @function topFrame
 * @param state {PaletteState} the state
 * @returns {Frame | undefined} the page on top, undefined while closed
 */
export const topFrame = (state: PaletteState): Frame | undefined =>
  state.stack[state.stack.length - 1];

const clamp = (index: number, count: number): number =>
  count === 0 ? 0 : Math.min(Math.max(index, 0), count - 1);

type Delta = 1 | -1 | "home" | "end";

const moved = (active: number, delta: Delta, count: number): number => {
  if (count === 0) return 0;
  if (delta === "home") return 0;
  if (delta === "end") return count - 1;
  return (active + delta + count) % count;
};

const withTop = (state: PaletteState, patch: Partial<Frame>): PaletteState => {
  const top = topFrame(state);
  if (!top) return state;
  return { ...state, stack: [...state.stack.slice(0, -1), { ...top, ...patch }] };
};

const withArg = (state: PaletteState, patch: Partial<ArgState>): PaletteState =>
  state.arg ? { ...state, arg: { ...state.arg, ...patch } } : state;

/**
 * @function reduce
 * @param state {PaletteState} the state before
 * @param action {PaletteAction} what happened
 * @returns {PaletteState} the state after; the same object when nothing changes
 */
export function reduce(state: PaletteState, action: PaletteAction): PaletteState {
  switch (action.type) {
    case "open": {
      const stack = [frame(action.root)];
      if (action.page) stack.push(frame(action.page));
      return { open: true, stack, arg: null };
    }
    case "close":
      return state.open ? { ...state, open: false } : state;
    case "query":
      return state.arg
        ? withArg(state, { query: action.value, active: 0, error: undefined })
        : withTop(state, { query: action.value, active: 0 });
    case "active": {
      const index = clamp(action.index, action.count);
      return state.arg ? withArg(state, { active: index }) : withTop(state, { active: index });
    }
    case "move": {
      const current = state.arg ? state.arg.active : (topFrame(state)?.active ?? 0);
      const active = moved(current, action.delta, action.count);
      return state.arg ? withArg(state, { active }) : withTop(state, { active });
    }
    case "push":
      return { ...state, stack: [...state.stack, frame(action.page)], arg: null };
    case "pop": {
      if (state.arg) {
        if (state.arg.index === 0) return { ...state, arg: null };
        const spec = state.arg.command.args?.[state.arg.index - 1];
        const values = { ...state.arg.values };
        if (spec) delete values[spec.name];
        return withArg(state, {
          index: state.arg.index - 1,
          values,
          query: "",
          active: 0,
          error: undefined,
        });
      }
      if (state.stack.length <= 1) return state;
      return { ...state, stack: state.stack.slice(0, -1) };
    }
    case "beginArgs":
      return {
        ...state,
        arg: { command: action.command, index: 0, values: {}, query: "", active: 0 },
      };
    case "argAccept": {
      if (!state.arg) return state;
      const specs = state.arg.command.args ?? [];
      const spec = specs[state.arg.index];
      if (!spec) return { ...state, arg: null };
      const values = { ...state.arg.values, [spec.name]: action.value };
      if (state.arg.index + 1 >= specs.length) return { ...state, arg: null };
      return withArg(state, {
        index: state.arg.index + 1,
        values,
        query: "",
        active: 0,
        error: undefined,
      });
    }
    case "argError":
      return withArg(state, { error: action.message });
    case "provided": {
      const target = state.stack[action.depth];
      if (!target) return state;
      const updated = {
        ...target,
        providers: { ...target.providers, [action.providerId]: action.result },
      };
      return { ...state, stack: state.stack.map((f, i) => (i === action.depth ? updated : f)) };
    }
  }
}
