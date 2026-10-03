/**
 * @file tests/components/palette/siteCommands.test.tsx
 * @desc siteCommands: ids and groups per option, `include` filtering, external pages and tools
 *       open a new tab, page actions call the browser, account commands follow signedIn, the
 *       shortcuts page lists every command with a shortcut, repo links only with `repo`.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { siteCommands } from "../../../src/components/palette/siteCommands.js";
import type { Command, PaletteContext } from "../../../src/components/palette/types.js";

const ctx = (over: Partial<PaletteContext> = {}): PaletteContext => ({
  navigate: vi.fn(),
  close: vi.fn(),
  push: vi.fn(),
  copy: vi.fn(async () => {}),
  pathname: "/here",
  commands: [],
  ...over,
});

const byId = (list: readonly Command[], id: string): Command => {
  const found = list.find((c) => c.id === id);
  if (!found) throw new Error(`no ${id}`);
  return found;
};

afterEach(() => vi.restoreAllMocks());

describe("siteCommands", () => {
  it("builds navigate, page, account and help groups with stable ids", () => {
    const list = siteCommands({
      pages: [
        { label: "Pools", href: "/pools" },
        { label: "osu!", href: "https://osu.ppy.sh" },
        { label: "Soon", note: "soon" },
      ],
      tools: "pools",
      repo: "https://github.com/haruhimemoe/pools.haruhime.moe",
      account: {
        signedIn: false,
        signInHref: "/signin",
        accountHref: "/account",
        signOutHref: "/api/auth/sign-out",
      },
    });
    expect(list.map((c) => c.id)).toEqual([
      "site.go.pools",
      "site.go.osu",
      "site.tool.packs",
      "site.tool.bb",
      "site.tool.home",
      "site.copy-url",
      "site.back",
      "site.top",
      "site.reload",
      "site.github",
      "site.sign-in",
      "site.account",
      "site.sign-out",
      "site.shortcuts",
      "site.report",
    ]);
    expect(byId(list, "site.go.pools")).toMatchObject({ title: "Go to Pools", group: "Navigate" });
    expect(byId(list, "site.copy-url")).toMatchObject({ group: "Page", shortcut: "mod+shift+c" });
    expect(byId(list, "site.shortcuts")).toMatchObject({
      group: "Help",
      shortcut: "?",
      closeOnRun: false,
    });
  });

  it("navigates in-app pages, opens external ones and tools in a new tab", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const list = siteCommands({
      pages: [
        { label: "Pools", href: "/pools" },
        { label: "osu!", href: "https://osu.ppy.sh" },
      ],
      tools: "pools",
    });
    const c = ctx();
    byId(list, "site.go.pools").run?.(c, {});
    expect(c.navigate).toHaveBeenCalledWith("/pools");
    byId(list, "site.go.osu").run?.(c, {});
    expect(open).toHaveBeenCalledWith("https://osu.ppy.sh", "_blank", "noopener");
    byId(list, "site.tool.packs").run?.(c, {});
    expect(open).toHaveBeenCalledWith("https://packs.haruhime.moe", "_blank", "noopener");
    expect(byId(list, "site.tool.home")).toMatchObject({ title: "Open haruhime.moe" });
    expect(siteCommands({ tools: false }).some((c) => c.id.startsWith("site.tool."))).toBe(false);
  });

  it("page actions copy, go back, scroll, reload and open the repo", () => {
    const back = vi.spyOn(history, "back").mockImplementation(() => {});
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const list = siteCommands({ repo: "https://github.com/x/y" });
    const c = ctx();
    byId(list, "site.copy-url").run?.(c, {});
    expect(c.copy).toHaveBeenCalledWith(location.href);
    byId(list, "site.back").run?.(c, {});
    expect(back).toHaveBeenCalled();
    byId(list, "site.top").run?.(c, {});
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    byId(list, "site.github").run?.(c, {});
    expect(open).toHaveBeenCalledWith("https://github.com/x/y", "_blank", "noopener");
    byId(list, "site.report").run?.(c, {});
    expect(open).toHaveBeenCalledWith("https://github.com/x/y/issues/new", "_blank", "noopener");
    expect(byId(list, "site.reload").run).toBeTypeOf("function");
    expect(siteCommands({}).some((c) => c.id === "site.github" || c.id === "site.report")).toBe(
      false,
    );
  });

  it("account commands show by signedIn and navigate their hrefs", () => {
    const list = siteCommands({
      account: { signedIn: true, signInHref: "/signin", accountHref: "/me", signOutHref: "/out" },
    });
    const c = ctx();
    expect(byId(list, "site.sign-in").when?.(c)).toBe(false);
    expect(byId(list, "site.account").when?.(c)).toBe(true);
    expect(byId(list, "site.sign-out").when?.(c)).toBe(true);
    byId(list, "site.sign-out").run?.(c, {});
    expect(c.navigate).toHaveBeenCalledWith("/out");
    const out = siteCommands({ account: { signedIn: false, signInHref: "/signin" } });
    expect(out.some((x) => x.id === "site.account")).toBe(false);
    expect(byId(out, "site.sign-in").when?.(c)).toBe(true);
    expect(siteCommands({}).some((x) => x.group === "Account")).toBe(false);
  });

  it("the shortcuts page lists every command with a shortcut, from the context", () => {
    const list = siteCommands({ include: ["help"] });
    expect(list.map((c) => c.id)).toEqual(["site.shortcuts"]);
    const others: Command[] = [
      { id: "x", title: "X", shortcut: "g x", run: () => {} },
      { id: "y", title: "Y", run: () => {} },
    ];
    const c = ctx({ commands: [...list, ...others] });
    byId(list, "site.shortcuts").run?.(c, {});
    const page = (c.push as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(page.title).toBe("Keyboard shortcuts");
    // Itself left out: selecting it there would only push another shortcuts page.
    expect(page.commands.map((x: Command) => x.id)).toEqual(["x"]);
  });

  it("scrolls without smooth under reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    byId(siteCommands({ include: ["page"] }), "site.top").run?.(ctx(), {});
    expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
    vi.unstubAllGlobals();
  });

  it("the shortcuts page leaves itself out", () => {
    const list = siteCommands();
    const push = vi.fn();
    const shortcuts = byId(list, "site.shortcuts");
    shortcuts?.run?.(ctx({ push, commands: list }), {});
    const page = push.mock.calls[0]?.[0];
    expect(page.commands.map((c: { id: string }) => c.id)).not.toContain("site.shortcuts");
    expect(page.commands.map((c: { id: string }) => c.id)).toContain("site.copy-url");
  });
});
