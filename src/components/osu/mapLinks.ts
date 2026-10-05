/**
 * @file src/components/osu/mapLinks.ts
 * @desc The osu! URLs the map display builds from plain ids: covers on assets.ppy.sh, beatmap and
 *       beatmapset pages, preview clips on b.ppy.sh, and the status labels. A URL is only ever
 *       built from a positive safe integer (isOsuId, pools' isSetId), so nothing odd lands in
 *       one. Pure, server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

/** osu!'s cover files. The same strings as @haruhimemoe/osu's CoverSize. */
export type MapCoverSize = "card" | "card@2x" | "list" | "list@2x" | "cover" | "cover@2x";

/**
 * @function isOsuId
 * @param value {unknown} an id as the page holds it
 * @returns {boolean} true only for a positive safe integer
 */
export const isOsuId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

/**
 * @function mapCoverUrl
 * @param beatmapsetId {number} the set
 * @param size {MapCoverSize} which cover file (default "list@2x", the 300px square)
 * @returns {string | null} the cover on assets.ppy.sh, or null for an id that isn't valid
 */
export function mapCoverUrl(beatmapsetId: number, size: MapCoverSize = "list@2x"): string | null {
  return isOsuId(beatmapsetId)
    ? `https://assets.ppy.sh/beatmaps/${beatmapsetId}/covers/${size}.jpg`
    : null;
}

/**
 * @function beatmapPageUrl
 * @param beatmapId {number} the difficulty
 * @returns {string} its page on osu!
 */
export const beatmapPageUrl = (beatmapId: number): string =>
  `https://osu.ppy.sh/beatmaps/${beatmapId}`;

/**
 * @function beatmapsetPageUrl
 * @param beatmapsetId {number} the set
 * @returns {string} its page on osu!
 */
export const beatmapsetPageUrl = (beatmapsetId: number): string =>
  `https://osu.ppy.sh/beatmapsets/${beatmapsetId}`;

/**
 * @function previewClipUrl
 * @param beatmapsetId {number} the set
 * @returns {string | null} its preview clip on b.ppy.sh, or null for an id that isn't valid
 */
export function previewClipUrl(beatmapsetId: number): string | null {
  return isOsuId(beatmapsetId) ? `https://b.ppy.sh/preview/${beatmapsetId}.mp3` : null;
}

/** How osu!'s set statuses read on a card. Anything else shows as osu! sent it. */
export const MAP_STATUS_LABELS: Readonly<Record<string, string>> = Object.freeze({
  ranked: "Ranked",
  approved: "Approved",
  loved: "Loved",
  qualified: "Qualified",
  pending: "Pending",
  wip: "WIP",
  graveyard: "Graveyard",
});
