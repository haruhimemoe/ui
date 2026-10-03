/**
 * @file tests/components/palette/rows.test.ts
 * @desc buildRows: empty query lists groups in order with Recent first; a query ranks and adds
 *       the calculator row at the root; provider hint rows for idle, loading, error and empty;
 *       provider rows after static ones in their own order; choice args become rows; `when`
 *       filters and a throwing `when` hides the row.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { describe, expect, it, vi } from "vitest";
import {
  buildRows,
  optionAt,
  optionCount,
  type RowsInput,
} from "../../../src/components/palette/rows.js";
import type { Command, PaletteContext } from "../../../src/components/palette/types.js";

const cmd = (id: string, group?: string, extra: Partial<Command> = {}): Command => ({
  id,
  title: id,
  run: () => {},
  ...(group ? { group } : {}),
  ...extra,
});

const ctx = {} as PaletteContext;

const base = (over: Partial<RowsInput> = {}): RowsInput => ({
  query: "",
  commands: [cmd("Copy URL", "Page"), cmd("Go home", "Navigate"), cmd("Sign out", "Account")],
  providers: [],
  providerResults: {},
  recentIds: [],
  boost: () => 0,
  isRoot: true,
  calculator: true,
  arg: null,
  ctx,
  ...over,
});

const ids = (input: RowsInput) =>
  buildRows(input).map((r) =>
    r.kind === "option" ? `${r.group}/${r.command.id}` : `hint:${r.text}`,
  );

describe("buildRows", () => {
  it("lists every command by group in declaration order, Recent first", () => {
    expect(ids(base({ recentIds: ["Sign out", "missing"] }))).toEqual([
      "Recent/Sign out",
      "Page/Copy URL",
      "Navigate/Go home",
      "Account/Sign out",
    ]);
    expect(ids(base())).toEqual(["Page/Copy URL", "Navigate/Go home", "Account/Sign out"]);
  });

  it("ranks on a query and shows no-match hint", () => {
    expect(ids(base({ query: "go" }))).toEqual(["Navigate/Go home"]);
    expect(ids(base({ query: "zzz" }))).toEqual(["hint:No matching commands"]);
  });

  it("puts the calculator row first at the root, not for a bare number, not off root", () => {
    const rows = buildRows(base({ query: "2+2" }));
    expect(rows[0]).toMatchObject({
      kind: "option",
      group: "Calculator",
      command: { id: "calc", title: "= 4", subtitle: "Enter to copy" },
    });
    expect(ids(base({ query: "2" }))).toEqual(["hint:No matching commands"]);
    expect(ids(base({ query: "2+2", isRoot: false }))).toEqual(["hint:No matching commands"]);
    expect(ids(base({ query: "2+2", calculator: false }))).toEqual(["hint:No matching commands"]);
  });

  it("shows provider states and appends provider rows after the static matches", () => {
    const provider = { id: "maps", group: "Maps", minLength: 2, search: async () => [] };
    expect(ids(base({ query: "g", providers: [provider] }))).toEqual([
      "Navigate/Go home",
      "hint:Type 2 characters to search",
    ]);
    expect(
      ids(
        base({
          query: "go",
          providers: [provider],
          providerResults: { maps: { state: "loading", rows: [] } },
        }),
      ),
    ).toEqual(["Navigate/Go home", "hint:Searching…"]);
    expect(
      ids(
        base({
          query: "go",
          providers: [provider],
          providerResults: { maps: { state: "error", rows: [] } },
        }),
      ),
    ).toEqual(["Navigate/Go home", "hint:Couldn't search, try again"]);
    expect(
      ids(
        base({
          query: "go",
          providers: [provider],
          providerResults: { maps: { state: "done", rows: [] } },
        }),
      ),
    ).toEqual(["Navigate/Go home", "hint:No results for “go”"]);
    const rows = base({
      query: "go",
      providers: [provider],
      providerResults: { maps: { state: "done", rows: [cmd("z"), cmd("a")] } },
    });
    expect(ids(rows)).toEqual(["Navigate/Go home", "Maps/z", "Maps/a"]);
    expect(
      ids(
        base({
          query: "zzz",
          commands: [],
          providers: [provider],
          providerResults: { maps: { state: "done", rows: [cmd("hit")] } },
        }),
      ),
    ).toEqual(["Maps/hit"]);
  });

  it("turns a choice arg into rows filtered by the arg query", () => {
    const arg = {
      command: cmd("mods", undefined, {
        args: [
          {
            name: "mod",
            label: "Mod",
            type: "choice" as const,
            choices: [
              { value: "HD", label: "Hidden" },
              { value: "HR", label: "Hard Rock" },
            ],
          },
        ],
      }),
      index: 0,
      values: {},
      query: "ha",
      active: 0,
    };
    const rows = buildRows(base({ arg }));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: "option",
      command: { id: "HR", title: "Hard Rock" },
      group: "Mod",
    });
    expect(ids(base({ arg: { ...arg, query: "" } }))).toEqual(["Mod/HD", "Mod/HR"]);
    expect(
      ids(
        base({
          arg: {
            ...arg,
            index: 0,
            command: cmd("t", undefined, { args: [{ name: "n", label: "N", type: "text" }] }),
          },
        }),
      ),
    ).toEqual([]);
  });

  it("hides commands whose `when` is false or throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const commands = [
      cmd("a", "G", { when: () => false }),
      cmd("b", "G", {
        when: () => {
          throw new Error("boom");
        },
      }),
      cmd("c", "G", { when: () => true }),
    ];
    expect(ids(base({ commands }))).toEqual(["G/c"]);
    expect(spy).toHaveBeenCalledOnce();
  });

  it("counts and finds options, skipping hints", () => {
    const rows = buildRows(base({ query: "g", providers: [{ id: "p", search: async () => [] }] }));
    expect(optionCount(rows)).toBe(1);
    expect(optionAt(rows, 0)?.command.id).toBe("Go home");
    expect(optionAt(rows, 1)).toBeUndefined();
  });
});
