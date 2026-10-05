/**
 * @file src/components/osu/MapPreviewButton.tsx
 * @desc A play/stop button for a set's preview clip from b.ppy.sh, filling its parent (MapCard
 *       stacks it on the cover square by grid, not absolute, so the card-link lift can't move
 *       it). One clip plays per page, at half volume; a clip stops once no button for its set is
 *       mounted. Renders nothing for a set id that isn't a positive whole number. Apps that load
 *       clips must allow `media-src https://b.ppy.sh` in their CSP. Finished class strings (no
 *       cx): server components render it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { type ComponentProps, useEffect } from "react";
import { isOsuId, previewClipUrl } from "./mapLinks.js";
import { holdMapPreview, toggleMapPreview, usePlayingMapSet } from "./previewPlayer.js";

/** Every native button prop except children and onClick, plus the set and its song. */
export type MapPreviewButtonProps = Omit<ComponentProps<"button">, "children" | "onClick"> & {
  /** The set whose clip plays. */
  beatmapsetId: number;
  /** "Artist - Title", for the button's name. */
  song: string;
  /** Replaces the b.ppy.sh clip. */
  src?: string | undefined;
  /** Replaces the button's names. */
  labels?: { play?: (song: string) => string; stop?: (song: string) => string } | undefined;
};

const BASE =
  "flex size-full items-center justify-center rounded-md text-c1 text-lg transition-colors";
const OFF = `${BASE} bg-b6/45 hover:bg-b6/65`;
const ON = `${BASE} bg-h2/70`;

/**
 * @function MapPreviewButton
 * @param props {MapPreviewButtonProps} the set, the song, optional src, labels and button props
 * @returns {JSX.Element | null} the play or stop button, or nothing for a bad set id
 */
export function MapPreviewButton({
  beatmapsetId,
  song,
  src,
  labels,
  className,
  ...props
}: MapPreviewButtonProps) {
  const playing = usePlayingMapSet();
  const valid = isOsuId(beatmapsetId);
  useEffect(() => (valid ? holdMapPreview(beatmapsetId) : undefined), [valid, beatmapsetId]);
  const url = src ?? (valid ? previewClipUrl(beatmapsetId) : null);
  if (!valid || url === null) return null;
  const on = playing === beatmapsetId;
  const name = on
    ? (labels?.stop ?? ((s: string) => `Stop preview of ${s}`))(song)
    : (labels?.play ?? ((s: string) => `Play preview of ${s}`))(song);
  const classes = on ? ON : OFF;
  return (
    <button
      type="button"
      aria-label={name}
      {...props}
      onClick={() => toggleMapPreview(beatmapsetId, url)}
      className={className ? `${classes} ${className}` : classes}
    >
      <span aria-hidden="true">{on ? "■" : "▶"}</span>
    </button>
  );
}
