/**
 * @file tests/components/palette/store.test.ts
 * @desc The reducer: open resets to the root (or opens onto a page), query and active per frame,
 *       move wraps, push and pop, pop at the root is a no-op, args step forward and back, and
 *       provider results land on the frame they were asked for.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it } from "vitest";
import {
  initialState,
  type PaletteState,
  reduce,
  topFrame,
} from "../../../src/components/palette/store.js";
import type { Command, Page } from "../../../src/components/palette/types.js";

const root: Page = { title: "Root", commands: [] };
const maps: Page = { title: "Maps" };
const withArgs: Command = {
  id: "jump",
  title: "Jump",
  args: [
    { name: "id", label: "Beatmap id", type: "number" },
    { name: "mod", label: "Mod", type: "text" },
  ],
  run: () => {},
};

const opened = (page?: Page): PaletteState => reduce(initialState(), { type: "open", root, page });

describe("reduce", () => {
  it("opens at the root with an empty query, or onto a page above the root", () => {
    const state = opened();
    expect(state.open).toBe(true);
    expect(state.stack).toHaveLength(1);
    expect(topFrame(state)?.page).toBe(root);
    const onto = opened(maps);
    expect(onto.stack.map((f) => f.page.title)).toEqual(["Root", "Maps"]);
    const reopened = reduce(reduce(onto, { type: "close" }), { type: "open", root });
    expect(reopened.stack).toHaveLength(1);
    expect(reopened.arg).toBeNull();
  });

  it("keeps query and active per frame; query resets active", () => {
    let state = reduce(opened(), { type: "query", value: "co" });
    state = reduce(state, { type: "move", delta: 1, count: 3 });
    expect(topFrame(state)).toMatchObject({ query: "co", active: 1 });
    state = reduce(state, { type: "push", page: maps });
    expect(topFrame(state)).toMatchObject({ query: "", active: 0 });
    state = reduce(state, { type: "pop" });
    expect(topFrame(state)).toMatchObject({ query: "co", active: 1 });
    state = reduce(state, { type: "query", value: "cop" });
    expect(topFrame(state)?.active).toBe(0);
  });

  it("wraps on move, jumps on home and end, clamps a bad hover index", () => {
    const base = opened();
    expect(topFrame(reduce(base, { type: "move", delta: -1, count: 3 }))?.active).toBe(2);
    const last = reduce(base, { type: "move", delta: "end", count: 3 });
    expect(topFrame(last)?.active).toBe(2);
    expect(topFrame(reduce(last, { type: "move", delta: 1, count: 3 }))?.active).toBe(0);
    expect(topFrame(reduce(last, { type: "move", delta: "home", count: 3 }))?.active).toBe(0);
    expect(topFrame(reduce(base, { type: "move", delta: 1, count: 0 }))?.active).toBe(0);
    expect(topFrame(reduce(base, { type: "active", index: 9, count: 3 }))?.active).toBe(2);
  });

  it("pop at the root does nothing", () => {
    const state = opened();
    expect(reduce(state, { type: "pop" })).toBe(state);
  });

  it("collects args one at a time, steps back, and clears when the last is accepted", () => {
    let state = reduce(opened(), { type: "beginArgs", command: withArgs });
    expect(state.arg).toMatchObject({ index: 0, values: {}, query: "" });
    state = reduce(state, { type: "query", value: "12" });
    expect(state.arg?.query).toBe("12");
    expect(topFrame(state)?.query).toBe("");
    state = reduce(state, { type: "argAccept", value: "12" });
    expect(state.arg).toMatchObject({ index: 1, values: { id: "12" }, query: "" });
    state = reduce(state, { type: "argError", message: "Required" });
    expect(state.arg?.error).toBe("Required");
    state = reduce(state, { type: "pop" });
    expect(state.arg).toMatchObject({ index: 0, values: {}, error: undefined });
    state = reduce(state, { type: "pop" });
    expect(state.arg).toBeNull();
    state = reduce(state, { type: "beginArgs", command: withArgs });
    state = reduce(state, { type: "argAccept", value: "1" });
    state = reduce(state, { type: "argAccept", value: "HD" });
    expect(state.arg).toBeNull();
  });

  it("stores provider results on the frame by depth and provider id", () => {
    let state = reduce(opened(maps), {
      type: "provided",
      depth: 1,
      providerId: "p",
      result: { state: "loading", rows: [] },
    });
    expect(topFrame(state)?.providers.p).toEqual({ state: "loading", rows: [] });
    state = reduce(state, {
      type: "provided",
      depth: 0,
      providerId: "p",
      result: { state: "error", rows: [] },
    });
    expect(state.stack[0]?.providers.p?.state).toBe("error");
    expect(
      reduce(state, {
        type: "provided",
        depth: 5,
        providerId: "p",
        result: { state: "done", rows: [] },
      }),
    ).toBe(state);
  });
});
