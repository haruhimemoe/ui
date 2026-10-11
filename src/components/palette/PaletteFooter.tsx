/**
 * @file src/components/palette/PaletteFooter.tsx
 * @desc The palette's bottom line (internal): the live region that announces the result count
 *       or the latest copy status, and the key hints (hidden on phones). No hooks, no cx.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sun Oct 11, 2026
 */

import { KBD_BASE } from "../basics/kbdStyles.js";
import { PALETTE_LABELS, type PaletteLabels } from "./labels.js";

/** The option count, whether Backspace goes back, and the latest status (keyed by its run). */
export type PaletteFooterProps = {
  count: number;
  nested: boolean;
  status: string | null;
  statusRun: number | null;
  /** Built-in text. Default PALETTE_LABELS. */
  labels?: PaletteLabels | undefined;
};

const FOOTER_KEY = `${KBD_BASE} px-1`;

/**
 * @function PaletteFooter
 * @param props {PaletteFooterProps} count, nested, status and its run
 * @returns {JSX.Element} the footer with its `<output>` live region
 */
export function PaletteFooter({
  count,
  nested,
  status,
  statusRun,
  labels = PALETTE_LABELS,
}: PaletteFooterProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b4 border-t px-4 py-2 text-c4 text-xs">
      <output aria-live="polite" className="truncate">
        {statusRun === null ? labels.results(count) : <span key={statusRun}>{status}</span>}
      </output>
      <span className="hidden shrink-0 gap-3 sm:flex">
        <span>
          <kbd className={FOOTER_KEY}>↑</kbd> <kbd className={FOOTER_KEY}>↓</kbd> {labels.navigate}
        </span>
        <span>
          <kbd className={FOOTER_KEY}>↵</kbd> {labels.select}
        </span>
        {nested ? (
          <span>
            <kbd className={FOOTER_KEY}>⌫</kbd> {labels.back}
          </span>
        ) : null}
        <span>
          <kbd className={FOOTER_KEY}>esc</kbd> {nested ? labels.back : labels.close}
        </span>
      </span>
    </div>
  );
}
