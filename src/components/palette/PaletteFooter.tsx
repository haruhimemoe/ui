/**
 * @file src/components/palette/PaletteFooter.tsx
 * @desc The palette's bottom line (internal): the live region that announces the result count
 *       or the latest copy status, and the key hints (hidden on phones). No hooks, no cx.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 4, 2026
 */

import { KBD_BASE } from "../basics/kbdStyles.js";

/** The option count, whether Backspace goes back, and the latest status (keyed by its run). */
export type PaletteFooterProps = {
  count: number;
  nested: boolean;
  status: string | null;
  statusRun: number | null;
};

const FOOTER_KEY = `${KBD_BASE} px-1`;

/**
 * @function PaletteFooter
 * @param props {PaletteFooterProps} count, nested, status and its run
 * @returns {JSX.Element} the footer with its `<output>` live region
 */
export function PaletteFooter({ count, nested, status, statusRun }: PaletteFooterProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b4 border-t px-4 py-2 text-c4 text-xs">
      <output aria-live="polite" className="truncate">
        {statusRun === null ? (
          `${count} ${count === 1 ? "result" : "results"}`
        ) : (
          <span key={statusRun}>{status}</span>
        )}
      </output>
      <span className="hidden shrink-0 gap-3 sm:flex">
        <span>
          <kbd className={FOOTER_KEY}>↑</kbd> <kbd className={FOOTER_KEY}>↓</kbd> navigate
        </span>
        <span>
          <kbd className={FOOTER_KEY}>↵</kbd> select
        </span>
        {nested ? (
          <span>
            <kbd className={FOOTER_KEY}>⌫</kbd> back
          </span>
        ) : null}
        <span>
          <kbd className={FOOTER_KEY}>esc</kbd> {nested ? "back" : "close"}
        </span>
      </span>
    </div>
  );
}
