/**
 * @file src/components/osu/mapData.ts
 * @desc The map display's data shape and words: MapData (field names match @haruhimemoe/osu's
 *       BeatmapMeta, every field optional, so `map={meta}` type-checks with no adapter), the
 *       labels MapCard and MapSetCard use, and two small helpers. Pure, server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ReactNode } from "react";

/** A map's data. Field names match @haruhimemoe/osu's BeatmapMeta; all optional. */
export type MapData = {
  beatmapsetId?: number | null;
  artist?: string | null;
  title?: string | null;
  version?: string | null;
  creator?: string | null;
  starRating?: number | null;
  cs?: number | null;
  ar?: number | null;
  od?: number | null;
  hp?: number | null;
  bpm?: number | null;
  lengthSeconds?: number | null;
  /** osu! API status: "ranked", "approved", "loved", "qualified", "pending", "wip", "graveyard". */
  status?: string | null;
};

/** Every word MapCard and MapSetCard show or announce, each replaceable. */
export type MapCardLabels = {
  mappedBy: (creator: string) => ReactNode;
  setMappedBy: (creator: string) => ReactNode;
  fallbackTitle: (beatmapId: number) => string;
  loading: (beatmapId: number) => string;
  missing: (beatmapId: number) => ReactNode;
  copyId: string;
  copyIdName: (beatmapId: number) => string;
  copyFailed: (beatmapId: number) => ReactNode;
};

/** The default English labels. */
export const DEFAULT_MAP_LABELS: MapCardLabels = {
  mappedBy: (creator) => `mapped by ${creator}`,
  setMappedBy: (creator) => `Mapped by ${creator}`,
  fallbackTitle: (id) => `Beatmap ${id}`,
  loading: (id) => `Loading beatmap ${id}`,
  missing: (id) => `Beatmap ${id} wasn't found. Check the ID.`,
  copyId: "Copy ID",
  copyIdName: (id) => `Copy ID ${id}`,
  copyFailed: (id) => `Couldn't copy. The beatmap ID is ${id}.`,
};

/**
 * @function songOf
 * @param map {MapData | null | undefined} a map's data
 * @returns {string | null} "Artist - Title" when both are known (not blank), else null
 */
export function songOf(map: MapData | null | undefined): string | null {
  const artist = map?.artist?.trim();
  const title = map?.title?.trim();
  return artist && title ? `${artist} - ${title}` : null;
}

/**
 * @function shownNumber
 * @param n {number | null | undefined} a value from app data
 * @returns {boolean} true for a finite number, the only kind the display prints
 */
export function shownNumber(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}
