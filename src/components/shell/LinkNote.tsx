/**
 * @file src/components/shell/LinkNote.tsx
 * @desc The small uppercase note beside a nav or footer entry, like "soon" (internal). NavItem and
 *       SiteFooter share it. No class merging, so the header's client list can render it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

/**
 * @function LinkNote
 * @param props {{ note?: string }} the entry's note, if any
 * @returns {JSX.Element | null} a space and the note in small muted capitals, or nothing
 */
export function LinkNote({ note }: { note?: string | undefined }) {
  return note ? (
    <>
      {" "}
      <span className="text-c4 text-xs uppercase tracking-wide">{note}</span>
    </>
  ) : null;
}
