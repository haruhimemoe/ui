/**
 * @file src/components/osu/MapCardRow.tsx
 * @desc MapCard's row layout (internal, server-safe): leading slot, slot pill, cover square,
 *       text column, then Copy ID and actions, which wrap under the text below the 2xl
 *       container width (42rem) and sit inline from there. A container query, so the same row
 *       fits a narrow editor column and a full-width list.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ReactNode } from "react";
import { MapCoverSquare } from "./MapCardParts.js";

/** The rendered pieces MapCard hands its layouts. */
export type MapCardLayoutParts = {
  compact: boolean;
  square: { url: string | null } | null;
  leading?: ReactNode;
  preview?: ReactNode;
  badges?: ReactNode;
  details?: ReactNode;
  actions?: ReactNode;
  title: ReactNode;
  artist: string | null;
  byline: ReactNode;
  slot: ReactNode;
  status: ReactNode;
  body: ReactNode;
  copy: ReactNode;
};

/**
 * @function MapCardRow
 * @param props {{ parts: MapCardLayoutParts }} the pieces
 * @returns {JSX.Element} the row
 */
export function MapCardRow({ parts: p }: { parts: MapCardLayoutParts }) {
  return (
    <div className="flex flex-wrap @2xl:flex-nowrap items-center gap-3">
      {p.leading}
      {p.slot ? <span className="flex w-14 shrink-0">{p.slot}</span> : null}
      {p.square ? (
        <MapCoverSquare
          url={p.square.url}
          preview={p.preview}
          className={p.compact ? "coarse:size-11 size-8" : "size-12"}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {p.title}
          {p.compact && p.byline ? (
            <span className="min-w-0 truncate text-c3 text-xs">· {p.byline}</span>
          ) : null}
          {p.status}
          {p.badges}
        </div>
        {!p.compact && p.byline ? <p className="truncate text-c3 text-sm">{p.byline}</p> : null}
        {p.body}
        {p.details ? <div className="mt-1">{p.details}</div> : null}
      </div>
      {p.copy || p.actions ? (
        <div className="flex @2xl:w-auto w-full @2xl:shrink-0 flex-wrap @2xl:flex-nowrap items-center gap-2">
          {p.copy}
          {p.actions}
        </div>
      ) : null}
    </div>
  );
}
