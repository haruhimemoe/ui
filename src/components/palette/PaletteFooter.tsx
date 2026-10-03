/**
 * @file src/components/palette/PaletteFooter.tsx
 * @desc The palette's bottom line (internal): the live region that announces the result count
 *       or the latest copy status, and the key hints (hidden on phones). No hooks, no cx.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

/** The option count, whether Backspace goes back, and the latest status (keyed by its run). */
export type PaletteFooterProps = {
  count: number;
  nested: boolean;
  status: string | null;
  statusRun: number | null;
};

const KBD = "rounded border border-b3 bg-b5 px-1 font-sans text-c3";

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
          <kbd className={KBD}>↑</kbd> <kbd className={KBD}>↓</kbd> navigate
        </span>
        <span>
          <kbd className={KBD}>↵</kbd> select
        </span>
        {nested ? (
          <span>
            <kbd className={KBD}>⌫</kbd> back
          </span>
        ) : null}
        <span>
          <kbd className={KBD}>esc</kbd> {nested ? "back" : "close"}
        </span>
      </span>
    </div>
  );
}
