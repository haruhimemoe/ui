/**
 * @file src/components/basics/Tabs.tsx
 * @desc A tab list for panels on the same page (not links; LinkTabs is for those): buttons with
 *       role="tab", the chosen one aria-selected and the only one in the Tab order. Left and Right
 *       (wrapping), Home and End pick and focus a tab. The panels are the caller's: give each
 *       `id={tabPanelId(idPrefix, tab)}`, role="tabpanel" and
 *       `aria-labelledby={tabId(idPrefix, tab)}`. Controlled. Moved from bb.haruhime.moe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import type { ComponentProps, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { tabId, tabPanelId } from "./tabIds.js";

/** One tab: its id (part of the tab's and panel's ids) and its text. */
export type TabItem<T extends string = string> = { id: T; label: ReactNode };

/** Every native `<div>` prop except `onChange` and children, plus the list's parts. */
export type TabsProps<T extends string = string> = Omit<
  ComponentProps<"div">,
  "onChange" | "children"
> & {
  /** Names the tab list. */
  label: string;
  /** Prefix for the tabs' and panels' ids (tabId, tabPanelId). */
  idPrefix: string;
  /** The tabs, left to right. */
  tabs: readonly TabItem<T>[];
  /** The chosen tab's id. */
  value: T;
  /** Called with the picked tab's id. */
  onChange: (id: T) => void;
};

const KEYS: Record<string, (at: number, count: number) => number> = {
  ArrowRight: (at, count) => (at + 1) % count,
  ArrowLeft: (at, count) => (at - 1 + count) % count,
  Home: () => 0,
  End: (_at, count) => count - 1,
};

/**
 * @function Tabs
 * @param props {TabsProps<T>} the list's name, id prefix, tabs, chosen tab and handler, and
 *        native div props
 * @returns {JSX.Element} the tablist with one pill button per tab
 */
export function Tabs<T extends string>({
  label,
  idPrefix,
  tabs,
  value,
  onChange,
  className,
  onKeyDown,
  ...props
}: TabsProps<T>) {
  // With no tab chosen, the first one is still reachable with Tab.
  const at = Math.max(
    0,
    tabs.findIndex((item) => item.id === value),
  );
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    const step = KEYS[event.key];
    if (!step || tabs.length === 0) return;
    const tab = tabs[step(at, tabs.length)];
    if (!tab) return;
    event.preventDefault();
    onChange(tab.id);
    document.getElementById(tabId(idPrefix, tab.id))?.focus();
  };
  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={move}
      className={cx(
        "flex gap-1 rounded-full bg-b4 p-1 contrast-more:inset-ring contrast-more:inset-ring-c4 forced-colors:border",
        className,
      )}
      {...props}
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={tabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={tabPanelId(idPrefix, tab.id)}
            tabIndex={index === at ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cx(
              "coarse:min-h-11 flex-1 rounded-full px-4 py-1.5 font-bold text-sm transition-colors",
              selected ? "bg-h2 text-c1 forced-colors:underline" : "text-c3 hover:text-c1",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
