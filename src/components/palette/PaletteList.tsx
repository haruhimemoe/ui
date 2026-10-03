/**
 * @file src/components/palette/PaletteList.tsx
 * @desc The palette's listbox (internal): option rows under group headings, hint rows as plain
 *       text, the active row scrolled into view. Hover makes a row active; click selects it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import { useEffect } from "react";
import { PaletteRow } from "./PaletteRow.js";
import type { Row } from "./rows.js";
import type { Command } from "./types.js";

/** The rows, which option is active, how to id an option, and the handlers. */
export type PaletteListProps = {
  id: string;
  rows: readonly Row[];
  active: number;
  mac: boolean;
  optionId: (index: number) => string;
  /** A provider is searching: the listbox is aria-busy. */
  busy?: boolean | undefined;
  onActivate: (index: number) => void;
  onSelect: (command: Command) => void;
};

type Segment =
  | {
      kind: "group";
      group: string;
      items: { row: Extract<Row, { kind: "option" }>; index: number }[];
    }
  | { kind: "hint"; row: Extract<Row, { kind: "hint" }> };

const segments = (rows: readonly Row[]): Segment[] => {
  const out: Segment[] = [];
  let index = 0;
  for (const row of rows) {
    if (row.kind === "hint") {
      out.push({ kind: "hint", row });
      continue;
    }
    const last = out[out.length - 1];
    const item = { row, index: index++ };
    if (last?.kind === "group" && last.group === row.group) last.items.push(item);
    else out.push({ kind: "group", group: row.group, items: [item] });
  }
  return out;
};

/**
 * @function PaletteList
 * @param props {PaletteListProps} rows, the active index, option ids and handlers
 * @returns {JSX.Element} the `role="listbox"`
 */
export function PaletteList({
  id,
  rows,
  active,
  mac,
  optionId,
  busy,
  onActivate,
  onSelect,
}: PaletteListProps) {
  // Runs for a new list too (its first row changes), so it scrolls back up when active stays 0.
  const first = rows[0]?.id;
  useEffect(() => {
    if (first === undefined) return;
    document.getElementById(optionId(active))?.scrollIntoView?.({ block: "nearest" });
  }, [active, optionId, first]);
  return (
    <div
      id={id}
      role="listbox"
      aria-label="Results"
      aria-busy={busy ? true : undefined}
      className="min-h-0 flex-1 overflow-y-auto p-2"
    >
      {segments(rows).map((segment) =>
        segment.kind === "hint" ? (
          // A listbox may only own options and groups, so a hint is a disabled option: it reads
          // "Searching…, dimmed" and can't be activated (optionAt skips it).
          // biome-ignore lint/a11y/useFocusableInteractive: options under aria-activedescendant aren't focusable
          <div
            key={segment.row.id}
            role="option"
            aria-disabled="true"
            aria-selected="false"
            className="px-3 py-2 text-c4 text-sm"
          >
            {segment.row.text}
          </div>
        ) : (
          // biome-ignore lint/a11y/useSemanticElements: a listbox's groups are role="group" divs (no element maps to it here)
          <div
            key={`${segment.group}:${segment.items[0]?.row.id}`}
            role="group"
            aria-labelledby={`${id}-${segment.items[0]?.index}-h`}
          >
            {/* No uppercase: screen readers may spell it out, and the tracking hurts readers. */}
            <div
              id={`${id}-${segment.items[0]?.index}-h`}
              className="px-3 pt-3 pb-1 font-bold text-c3 text-xs"
            >
              {segment.group}
            </div>
            {segment.items.map(({ row, index }) => (
              <PaletteRow
                key={row.id}
                id={optionId(index)}
                command={row.command}
                ranges={row.ranges}
                active={index === active}
                mac={mac}
                onHover={() => onActivate(index)}
                onSelect={() => onSelect(row.command)}
              />
            ))}
          </div>
        ),
      )}
    </div>
  );
}
