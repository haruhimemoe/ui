/**
 * @file src/components/palette/PaletteRow.tsx
 * @desc One option in the palette's list (internal): icon slot, the title with its matched
 *       characters marked, the subtitle, and the shortcut as kbd parts. Finished class strings,
 *       no hooks: the list sets aria-selected and the pointer handlers. Keyboard handling lives
 *       on the dialog, so this isn't focusable (aria-activedescendant names it).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import type { ReactNode } from "react";
import type { FuzzyMatch } from "./fuzzy.js";
import { displayShortcut, parseShortcut } from "./hotkeys.js";
import type { Command } from "./types.js";

/** The row's id (for aria-activedescendant), its command and spans, whether it's active. */
export type PaletteRowProps = {
  id: string;
  command: Command;
  ranges: FuzzyMatch["ranges"];
  active: boolean;
  mac: boolean;
  onHover: () => void;
  onSelect: () => void;
};

// The active row shows its state with an h1 edge, not background alone: bg-b4 on b6 is only
// 1.5:1. min-h-9 keeps every row a 36px target.
const ROW =
  "flex min-h-9 cursor-default items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2";
const ACTIVE = `${ROW} border-h1 bg-b4 forced-colors:border-[Highlight] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]`;
const KBD = "rounded border border-b3 bg-b5 px-1.5 font-sans text-c3 text-xs";

const highlighted = (title: string, ranges: FuzzyMatch["ranges"]): ReactNode[] => {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const [start, end] of ranges) {
    if (start > at) parts.push(title.slice(at, start));
    parts.push(
      <mark key={start} className="bg-transparent text-h1">
        {title.slice(start, end)}
      </mark>,
    );
    at = end;
  }
  if (at < title.length) parts.push(title.slice(at));
  return parts;
};

/**
 * @function PaletteRow
 * @param props {PaletteRowProps} the option's id, command, matched spans, active state, platform
 *        and pointer handlers
 * @returns {JSX.Element} a `role="option"` row
 */
export function PaletteRow({
  id,
  command,
  ranges,
  active,
  mac,
  onHover,
  onSelect,
}: PaletteRowProps) {
  const shortcut = command.shortcut ? parseShortcut(command.shortcut) : null;
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keys are handled by the combobox input
    // biome-ignore lint/a11y/useFocusableInteractive: the input's aria-activedescendant names the active option; focus stays on the input
    <div
      id={id}
      role="option"
      aria-selected={active}
      className={active ? ACTIVE : ROW}
      onPointerMove={onHover}
      onClick={onSelect}
    >
      {command.icon ? (
        <span className="flex size-5 shrink-0 items-center justify-center text-c3">
          {command.icon}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold text-c1 text-sm">
          {highlighted(command.title, ranges)}
        </span>
        {command.subtitle ? (
          <span className="truncate text-c4 text-xs">{command.subtitle}</span>
        ) : null}
      </span>
      {shortcut ? (
        <span className="flex shrink-0 gap-1">
          {displayShortcut(shortcut, mac).map((part, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: parts are static per shortcut
            <kbd key={index} className={KBD}>
              {part}
            </kbd>
          ))}
        </span>
      ) : null}
    </div>
  );
}
