/**
 * @file src/components/osu/previewPlayer.ts
 * @desc The page's one preview clip, ported from pools.haruhime.moe's usePreviewPlayer: a clip
 *       plays straight from osu!'s CDN in the browser, and starting one stops whatever was
 *       playing, so only one ever plays. A clip that ends, or can't play, frees the player.
 *       usePlayingMapSet says which set is playing, for the buttons.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { useSyncExternalStore } from "react";

/** Preview clips are loud next to a page: they start at half volume. */
export const PREVIEW_VOLUME = 0.5;

let current: { beatmapsetId: number; audio: HTMLAudioElement } | null = null;
const listeners = new Set<() => void>();
const emit = () => {
  for (const listener of listeners) listener();
};
const release = (audio: HTMLAudioElement) => {
  if (current?.audio !== audio) return;
  current = null;
  emit();
};

/**
 * @function stopMapPreview
 * @returns {void} stops the clip that's playing, if one is
 */
export const stopMapPreview = (): void => {
  if (!current) return;
  current.audio.pause();
  current = null;
  emit();
};

/**
 * @function toggleMapPreview
 * @param beatmapsetId {number} the set whose button was pressed
 * @param url {string} its clip
 * @returns {void} stops it when it's the one playing; otherwise stops any other and plays it
 */
export const toggleMapPreview = (beatmapsetId: number, url: string): void => {
  if (current?.beatmapsetId === beatmapsetId) {
    stopMapPreview();
    return;
  }
  stopMapPreview();
  const audio = new Audio(url);
  audio.volume = PREVIEW_VOLUME;
  audio.addEventListener("ended", () => release(audio));
  current = { beatmapsetId, audio };
  emit();
  audio.play().catch(() => release(audio));
};

/** How many preview buttons each set has on the page. */
const shown = new Map<number, number>();

/**
 * @function holdMapPreview
 * @param beatmapsetId {number} a set whose preview button just mounted
 * @returns {() => void} for when it unmounts: once the set has no button left, its clip stops
 *          (a page of results changed, the slot went, or the page did), since nothing could stop
 *          it any more
 */
export const holdMapPreview = (beatmapsetId: number): (() => void) => {
  shown.set(beatmapsetId, (shown.get(beatmapsetId) ?? 0) + 1);
  return () => {
    const left = (shown.get(beatmapsetId) ?? 1) - 1;
    if (left > 0) {
      shown.set(beatmapsetId, left);
      return;
    }
    shown.delete(beatmapsetId);
    if (current?.beatmapsetId === beatmapsetId) stopMapPreview();
  };
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * @function playingMapSet
 * @returns {number | null} the set whose clip is playing, or null
 */
export const playingMapSet = (): number | null => current?.beatmapsetId ?? null;

/**
 * @function usePlayingMapSet
 * @returns {number | null} the set whose clip is playing, or null
 */
export const usePlayingMapSet = (): number | null =>
  useSyncExternalStore(subscribe, playingMapSet, () => null);
