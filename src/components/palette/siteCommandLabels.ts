/**
 * @file src/components/palette/siteCommandLabels.ts
 * @desc siteCommands' titles, subtitles and group headings, English by default. Plain data with
 *       no directive, so a server component can read SITE_COMMAND_LABELS (siteCommands.ts is a
 *       client module, which a server import would only see as a reference).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 11, 2026
 * @modified Sun Oct 11, 2026
 */

/** Every title, subtitle and group heading siteCommands writes. */
export type SiteCommandLabels = {
  navigate: string;
  page: string;
  account: string;
  help: string;
  goTo: (label: string) => string;
  openTool: (name: string) => string;
  openHome: string;
  allTools: string;
  copyUrl: string;
  back: string;
  top: string;
  reload: string;
  github: string;
  signIn: string;
  myAccount: string;
  signOut: string;
  shortcuts: string;
  filterShortcuts: string;
  reportBug: string;
};

/** The English defaults. */
export const SITE_COMMAND_LABELS: SiteCommandLabels = {
  navigate: "Navigate",
  page: "Page",
  account: "Account",
  help: "Help",
  goTo: (label) => `Go to ${label}`,
  openTool: (name) => `Open ${name}`,
  openHome: "Open haruhime.moe",
  allTools: "all tools",
  copyUrl: "Copy page URL",
  back: "Go back",
  top: "Scroll to top",
  reload: "Reload page",
  github: "Open on GitHub",
  signIn: "Sign in",
  myAccount: "My account",
  signOut: "Sign out",
  shortcuts: "Keyboard shortcuts",
  filterShortcuts: "Filter shortcuts…",
  reportBug: "Report a bug",
};
