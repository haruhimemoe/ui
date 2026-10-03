/**
 * @file src/components/palette/siteCommands.ts
 * @desc The default command set every tool gets: "Go to <page>" from the nav items, "Open
 *       <tool>" from HARUHIME_TOOLS, page actions (copy URL, back, top, reload, GitHub), account
 *       (sign in, my account, sign out by signedIn), and help (the shortcuts page, report a bug).
 *       Ids are stable ("site.copy-url") so recents survive relabeling. Client-only: it opens
 *       tabs and scrolls.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import { isExternalHref } from "../../utils/href.js";
import { HARUHIME_TOOLS, type HaruhimeToolId } from "../shell/haruhimeTools.js";
import type { SiteLinkItem } from "../shell/links.js";
import type { Command, PaletteContext } from "./types.js";

/** Which default groups to build and what they need. */
export type SiteCommandsOptions = {
  /** The nav items the app passes to SiteHeader; one "Go to <label>" per linked item. */
  pages?: readonly SiteLinkItem[] | undefined;
  /** "Open <tool>" for every other live tool plus haruhime.moe. The current tool is skipped. false leaves them out. */
  tools?: HaruhimeToolId | false | undefined;
  /** The app's repo URL: "Open on GitHub" and "Report a bug". */
  repo?: string | undefined;
  account?:
    | {
        signedIn: boolean;
        signInHref: string;
        accountHref?: string | undefined;
        /** Navigated, not fetched (next-kit's sign-out route). */
        signOutHref?: string | undefined;
      }
    | undefined;
  /** Default: every group. */
  include?: readonly ("navigate" | "page" | "account" | "help")[] | undefined;
};

const slug = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "page";

const openTab = (href: string): void => {
  window.open(href, "_blank", "noopener");
};

const go = (href: string, ctx: PaletteContext) =>
  isExternalHref(href) ? openTab(href) : ctx.navigate(href);

const reducedMotion = (): boolean =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const navigate = (options: SiteCommandsOptions): Command[] => {
  const pages = (options.pages ?? []).flatMap((item): Command[] => {
    const href = item.href;
    if (!href) return [];
    return [
      {
        id: `site.go.${slug(item.label)}`,
        title: `Go to ${item.label}`,
        group: "Navigate",
        keywords: [href],
        run: (ctx) => go(href, ctx),
      },
    ];
  });
  if (options.tools === false) return pages;
  const tools = HARUHIME_TOOLS.filter((tool) => tool.id !== options.tools).map(
    (tool): Command => ({
      id: `site.tool.${tool.id}`,
      title: `Open ${tool.name}`,
      subtitle: tool.blurb,
      group: "Navigate",
      run: () => openTab(tool.href),
    }),
  );
  tools.push({
    id: "site.tool.home",
    title: "Open haruhime.moe",
    subtitle: "all tools",
    group: "Navigate",
    run: () => openTab("https://www.haruhime.moe"),
  });
  return [...pages, ...tools];
};

const page = (options: SiteCommandsOptions): Command[] => {
  const list: Command[] = [
    {
      id: "site.copy-url",
      title: "Copy page URL",
      group: "Page",
      shortcut: "mod+shift+c",
      closeOnRun: false,
      run: (ctx) => ctx.copy(location.href),
    },
    { id: "site.back", title: "Go back", group: "Page", run: () => history.back() },
    {
      id: "site.top",
      title: "Scroll to top",
      group: "Page",
      run: () => window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }),
    },
    { id: "site.reload", title: "Reload page", group: "Page", run: () => location.reload() },
  ];
  if (options.repo)
    list.push({
      id: "site.github",
      title: "Open on GitHub",
      group: "Page",
      keywords: ["source", "repo"],
      run: () => openTab(options.repo as string),
    });
  return list;
};

const account = (options: SiteCommandsOptions): Command[] => {
  const acct = options.account;
  if (!acct) return [];
  const list: Command[] = [
    {
      id: "site.sign-in",
      title: "Sign in",
      group: "Account",
      when: () => !acct.signedIn,
      run: (ctx) => ctx.navigate(acct.signInHref),
    },
  ];
  if (acct.accountHref)
    list.push({
      id: "site.account",
      title: "My account",
      group: "Account",
      when: () => acct.signedIn,
      run: (ctx) => ctx.navigate(acct.accountHref as string),
    });
  if (acct.signOutHref)
    list.push({
      id: "site.sign-out",
      title: "Sign out",
      group: "Account",
      when: () => acct.signedIn,
      run: (ctx) => ctx.navigate(acct.signOutHref as string),
    });
  return list;
};

const help = (options: SiteCommandsOptions): Command[] => {
  const list: Command[] = [
    {
      id: "site.shortcuts",
      title: "Keyboard shortcuts",
      group: "Help",
      shortcut: "?",
      closeOnRun: false,
      run: (ctx) =>
        ctx.push({
          title: "Keyboard shortcuts",
          placeholder: "Filter shortcuts…",
          commands: ctx.commands.filter((c) => c.shortcut && c.id !== "site.shortcuts"),
        }),
    },
  ];
  if (options.repo)
    list.push({
      id: "site.report",
      title: "Report a bug",
      group: "Help",
      keywords: ["issue", "feedback"],
      run: () => openTab(`${options.repo}/issues/new`),
    });
  return list;
};

const BUILDERS = { navigate, page, account, help } as const;

/**
 * @function siteCommands
 * @param options {SiteCommandsOptions} pages, tools, repo, account and which groups to include
 * @returns {Command[]} the defaults in order: Navigate, Page, Account, Help
 */
export function siteCommands(options: SiteCommandsOptions = {}): Command[] {
  const include = options.include ?? ["navigate", "page", "account", "help"];
  return include.flatMap((group) => BUILDERS[group](options));
}
