/**
 * @file src/components/osu/mapCardView.ts
 * @desc What MapCard shows, worked out from its props before any markup (internal): titles,
 *       link, cover square and background URLs, stars and stats with per-key overrides and
 *       non-finite numbers dropped, the state flags and the status text. Pure, server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import {
  DEFAULT_MAP_LABELS,
  type MapCardLabels,
  type MapData,
  shownNumber,
  songOf,
} from "./mapData.js";
import {
  beatmapPageUrl,
  isOsuId,
  MAP_STATUS_LABELS,
  type MapCoverSize,
  mapCoverUrl,
} from "./mapLinks.js";

const STAT_KEYS = ["cs", "ar", "od", "hp", "bpm", "lengthSeconds"] as const;
type StatKey = (typeof STAT_KEYS)[number];

/** Per-key stat overrides (a key that is present wins, even as null). */
export type MapStats = Partial<Pick<MapData, StatKey>>;

/** The props mapCardView reads. */
export type MapCardViewInput = {
  beatmapId: number;
  map?: MapData | null | undefined;
  state?: "ready" | "loading" | "missing" | "error" | undefined;
  layout?: "row" | "card" | undefined;
  background?: "none" | "cover" | "blur" | undefined;
  coverUrl?: string | null | undefined;
  stars?: number | null | undefined;
  stats?: MapStats | undefined;
  showStatus?: boolean | undefined;
  statusLabel?: string | undefined;
  href?: string | null | undefined;
  wholeCardLink?: boolean | undefined;
  labels?: Partial<MapCardLabels> | undefined;
};

/** What MapCard draws. */
export type MapCardView = {
  labels: MapCardLabels;
  failed: boolean;
  loading: boolean;
  skeleton: boolean;
  fullTitle: string;
  songTitle: string;
  artist: string | null;
  version: string | null;
  creator: string | null;
  link: string | null;
  whole: boolean;
  square: { url: string | null } | null;
  backgroundUrl: string | null;
  stars: number | null;
  stats: Record<StatKey, number | null>;
  hasFacts: boolean;
  status: string | null;
  statusText: string | null;
};

const text = (s: string | null | undefined): string | null => s?.trim() || null;

/**
 * @function mapCardView
 * @param input {MapCardViewInput} MapCard's data props
 * @returns {MapCardView} the titles, URLs, numbers and flags MapCard renders
 */
export function mapCardView(input: MapCardViewInput): MapCardView {
  const labels = { ...DEFAULT_MAP_LABELS, ...input.labels };
  const state = input.state ?? "ready";
  const failed = state === "missing" || state === "error";
  const map = failed ? null : (input.map ?? null);
  const song = songOf(map);
  const fallback = labels.fallbackTitle(input.beatmapId);
  const link =
    input.href === null
      ? null
      : (input.href ?? (isOsuId(input.beatmapId) ? beatmapPageUrl(input.beatmapId) : null));
  const setId = map?.beatmapsetId;
  const derived = (size: MapCoverSize) => (isOsuId(setId) ? mapCoverUrl(setId, size) : null);
  const noCover = failed || input.coverUrl === null;
  const background = input.background ?? "none";
  const overrides: MapStats = failed ? {} : (input.stats ?? {});
  const stats = Object.fromEntries(
    STAT_KEYS.map((key) => {
      const value = key in overrides ? overrides[key] : map?.[key];
      return [key, shownNumber(value) ? value : null];
    }),
  ) as Record<StatKey, number | null>;
  const rawStars = input.stars !== undefined ? input.stars : map?.starRating;
  const stars = !failed && shownNumber(rawStars) ? rawStars : null;
  const status = text(map?.status);
  const card = input.layout === "card";
  return {
    labels,
    failed,
    loading: state === "loading",
    skeleton: state === "loading" && song === null,
    fullTitle: song ?? fallback,
    songTitle: song ? (text(map?.title) as string) : fallback,
    artist: song ? text(map?.artist) : null,
    version: text(map?.version),
    creator: text(map?.creator),
    link,
    whole: (input.wholeCardLink ?? card) && link !== null,
    square: noCover ? null : { url: input.coverUrl ?? derived("list@2x") },
    backgroundUrl: noCover || background === "none" ? null : (input.coverUrl ?? derived("card@2x")),
    stars,
    stats,
    hasFacts: stars !== null || STAT_KEYS.some((key) => stats[key] !== null),
    status: (input.showStatus ?? card) ? status : null,
    statusText: status === null ? null : (input.statusLabel ?? MAP_STATUS_LABELS[status] ?? status),
  };
}
