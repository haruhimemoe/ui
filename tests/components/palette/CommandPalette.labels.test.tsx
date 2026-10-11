/**
 * @file tests/components/palette/CommandPalette.labels.test.tsx
 * @desc The palette's `labels`: the footer count and key hints, the listbox name, group
 *       headings, provider hints, argument errors and copy statuses all come from it, merged over
 *       PALETTE_LABELS; siteCommands' `labels` renames titles and groups but keeps ids.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 11, 2026
 * @modified Sun Oct 11, 2026
 */

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PALETTE_LABELS } from "../../../src/components/palette/labels.js";
import { PaletteFooter } from "../../../src/components/palette/PaletteFooter.js";
import { buildRows, type RowsInput } from "../../../src/components/palette/rows.js";
import { siteCommands } from "../../../src/components/palette/siteCommands.js";
import type { Command, PaletteContext } from "../../../src/components/palette/types.js";
import { dialog, input, pressHotkey, renderPalette } from "../../helpers/palette.js";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ push }), usePathname: () => "/here" }));

afterEach(() => vi.restoreAllMocks());

const JA = {
  ...PALETTE_LABELS,
  results: (n: number) => `${n}件`,
  list: "結果",
  navigate: "移動",
  select: "選択",
  back: "戻る",
  close: "閉じる",
  recent: "最近",
  commands: "コマンド",
  calculator: "電卓",
  enterToCopy: "Enterでコピー",
  providerResults: "検索結果",
  typeToSearch: (min: number) => `${min}文字入力`,
  searching: "検索中…",
  searchFailed: "検索失敗",
  noResults: (q: string) => `「${q}」なし`,
  noMatches: "一致なし",
};

const run: Command = { id: "a", title: "alpha", run: () => {} };
const base = (over: Partial<RowsInput> = {}): RowsInput => ({
  query: "",
  commands: [run],
  providers: [],
  providerResults: {},
  recentIds: [],
  boost: () => 0,
  isRoot: true,
  calculator: true,
  arg: null,
  ctx: {} as PaletteContext,
  labels: JA,
  ...over,
});
const texts = (rows: ReturnType<typeof buildRows>) =>
  rows.map((row) => (row.kind === "hint" ? row.text : `${row.group}:${row.command.title}`));

describe("buildRows labels", () => {
  it("names the default group, Recent and the calculator", () => {
    expect(texts(buildRows(base({ recentIds: ["a"] })))).toEqual(["最近:alpha", "コマンド:alpha"]);
    const calc = buildRows(base({ query: "1+1" }))[0];
    expect(calc?.kind === "option" && [calc.group, calc.command.subtitle]).toEqual([
      "電卓",
      "Enterでコピー",
    ]);
  });

  it("writes provider hints and the no-match hint", () => {
    const provider = { id: "p", search: async () => [] };
    expect(texts(buildRows(base({ query: "x", providers: [provider] })))).toEqual(["2文字入力"]);
    const at = (state: "loading" | "error" | "done") =>
      texts(
        buildRows(
          base({
            query: "zz",
            providers: [provider],
            providerResults: { p: { state, rows: [] } },
          }),
        ),
      );
    expect(at("loading")).toEqual(["検索中…"]);
    expect(at("error")).toEqual(["検索失敗"]);
    expect(at("done")).toEqual(["「zz」なし"]);
    const found = buildRows(
      base({
        query: "zz",
        providers: [provider],
        providerResults: { p: { state: "done", rows: [run] } },
      }),
    );
    expect(texts(found)).toEqual(["検索結果:alpha"]);
    expect(texts(buildRows(base({ query: "qqq" })))).toEqual(["一致なし"]);
  });
});

describe("PaletteFooter labels", () => {
  it("counts and hints in the given words", () => {
    const { rerender } = render(
      <PaletteFooter count={3} nested={false} status={null} statusRun={null} labels={JA} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("3件");
    expect(document.body).toHaveTextContent("移動");
    expect(document.body).toHaveTextContent("閉じる");
    rerender(<PaletteFooter count={1} nested status={null} statusRun={null} labels={JA} />);
    expect(document.body).toHaveTextContent("戻る");
  });
});

describe("CommandPalette labels", () => {
  it("merges a partial over the defaults", async () => {
    const { user } = renderPalette({ labels: { list: "結果", results: (n) => `${n}件` } });
    await pressHotkey(user);
    expect(dialog().open).toBe(true);
    expect(screen.getByRole("listbox", { name: "結果" })).toBeInTheDocument();
    expect(screen.getAllByRole("status").some((el) => /件$/.test(el.textContent ?? ""))).toBe(true);
    expect(document.body).toHaveTextContent("navigate");
  });

  it("names argument errors and copy statuses", async () => {
    const commands: Command[] = [
      {
        id: "n",
        title: "number",
        args: [{ name: "n", label: "How many", type: "number" }],
        run: () => {},
      },
      { id: "c", title: "copy it", closeOnRun: false, run: (ctx) => ctx.copy("x") },
    ];
    const { user } = renderPalette({
      commands,
      labels: { required: "必須", enterNumber: "数字", copied: "済", copyFailed: "失敗" },
    });
    await pressHotkey(user);
    await user.type(input(), "number");
    await user.keyboard("{Enter}{Enter}");
    expect(document.body).toHaveTextContent("必須");
    await user.type(input(), "x{Enter}");
    expect(document.body).toHaveTextContent("数字");
    await user.keyboard("{Escape}");
    await user.clear(input());
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => {}) },
    });
    await user.type(input(), "copy it{Enter}");
    expect(await screen.findByText("済")).toBeInTheDocument();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn(async () => Promise.reject(new Error("no"))) },
    });
    await user.keyboard("{Enter}");
    expect(await screen.findByText("失敗")).toBeInTheDocument();
  });
});

describe("siteCommands labels", () => {
  it("renames titles and groups, keeps ids", () => {
    const list = siteCommands({
      pages: [{ label: "Packs", href: "/packs" }],
      tools: "packs",
      repo: "https://github.com/x/y",
      account: { signedIn: false, signInHref: "/in", accountHref: "/me", signOutHref: "/out" },
      labels: {
        navigate: "移動",
        page: "ページ",
        account: "アカウント",
        help: "ヘルプ",
        goTo: (l) => `${l}へ`,
        openTool: (n) => `${n}を開く`,
        signIn: "ログイン",
        shortcuts: "ショートカット",
        filterShortcuts: "絞り込み…",
        reportBug: "バグ報告",
      },
    });
    const go = list.find((c) => c.id === "site.go.packs");
    expect([go?.title, go?.group]).toEqual(["Packsへ", "移動"]);
    expect(list.find((c) => c.id === "site.tool.pools")?.title).toBe("poolsを開く");
    expect(list.find((c) => c.id === "site.copy-url")?.group).toBe("ページ");
    expect(list.find((c) => c.id === "site.sign-in")?.title).toBe("ログイン");
    expect(list.find((c) => c.id === "site.report")?.group).toBe("ヘルプ");
    expect(list.find((c) => c.id === "site.github")?.title).toBe("Open on GitHub");
    const pushPage = vi.fn();
    list
      .find((c) => c.id === "site.shortcuts")
      ?.run?.({ push: pushPage, commands: [] } as unknown as PaletteContext, {});
    expect(pushPage).toHaveBeenCalledWith(
      expect.objectContaining({ title: "ショートカット", placeholder: "絞り込み…" }),
    );
  });
});
