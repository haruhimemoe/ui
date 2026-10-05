/**
 * @file src/components/osu/MapCardPanel.tsx
 * @desc MapCard's card layout (internal, server-safe), after osu-web's beatmapset panel: a
 *       100px square cover (72px compact) holding the preview with the slot pill pinned over it,
 *       an info column (status and badges, title, artist, then "[version] mapped by" pushed down,
 *       then stars and stats), and a footer row for details, Copy ID and actions that is always
 *       visible: no hover-only controls.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { cx } from "../../utils/cx.js";
import { MapCoverSquare } from "./MapCardParts.js";
import type { MapCardLayoutParts } from "./MapCardRow.js";

/**
 * @function MapCardPanel
 * @param props {{ parts: MapCardLayoutParts }} the pieces
 * @returns {JSX.Element} the panel and its footer
 */
export function MapCardPanel({ parts: p }: { parts: MapCardLayoutParts }) {
  return (
    <>
      <div className={cx("flex", p.compact ? "min-h-[72px]" : "min-h-[100px]")}>
        {p.leading ? <div className="flex shrink-0 items-center pl-2.5">{p.leading}</div> : null}
        {p.square ? (
          <MapCoverSquare
            url={p.square.url}
            preview={p.preview}
            badge={p.slot}
            className={cx("self-start rounded-none", p.compact ? "size-[72px]" : "size-[100px]")}
          />
        ) : p.slot ? (
          <div className="shrink-0 p-2.5">{p.slot}</div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-2.5">
          {p.status || p.badges ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {p.status}
              {p.badges}
            </div>
          ) : null}
          {p.title}
          {p.artist ? <p className="truncate text-c3 text-sm">{p.artist}</p> : null}
          {p.byline ? <p className="mt-auto truncate text-c3 text-sm">{p.byline}</p> : null}
          {p.body}
        </div>
      </div>
      {p.details || p.copy || p.actions ? (
        <div className="flex flex-wrap items-center gap-2 border-b3 border-t px-2.5 py-2">
          {p.details ? <div className="min-w-0 flex-1">{p.details}</div> : null}
          {p.copy}
          {p.actions}
        </div>
      ) : null}
    </>
  );
}
