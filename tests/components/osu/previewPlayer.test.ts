/**
 * @file tests/components/osu/previewPlayer.test.ts
 * @desc The page's one preview clip: toggling, one at a time, half volume, a clip that ends or
 *       fails to play frees the player, and a set's clip stops once its last holder lets go.
 *       Media playback is stubbed.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  holdMapPreview,
  PREVIEW_VOLUME,
  playingMapSet,
  stopMapPreview,
  toggleMapPreview,
} from "../../../src/components/osu/previewPlayer.js";

let played: HTMLMediaElement[] = [];
let fail = false;
beforeEach(() => {
  played = [];
  fail = false;
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    played.push(this);
    return fail ? Promise.reject(new Error("blocked")) : Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
});
afterEach(() => {
  stopMapPreview();
  vi.restoreAllMocks();
});

describe("previewPlayer", () => {
  it("plays one clip at half volume, and a second press on the set stops it", () => {
    toggleMapPreview(1, "https://b.ppy.sh/preview/1.mp3");
    expect(playingMapSet()).toBe(1);
    expect(played[0]?.volume).toBe(PREVIEW_VOLUME);
    toggleMapPreview(1, "https://b.ppy.sh/preview/1.mp3");
    expect(playingMapSet()).toBeNull();
  });

  it("stops the playing clip when another set starts", () => {
    toggleMapPreview(1, "/a.mp3");
    toggleMapPreview(2, "/b.mp3");
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    expect(playingMapSet()).toBe(2);
  });

  it("frees the player when the clip ends or fails to play", async () => {
    toggleMapPreview(1, "/a.mp3");
    played[0]?.dispatchEvent(new Event("ended"));
    expect(playingMapSet()).toBeNull();
    fail = true;
    toggleMapPreview(2, "/missing.mp3");
    await Promise.resolve();
    await Promise.resolve();
    expect(playingMapSet()).toBeNull();
  });

  it("stops a set's clip once its last holder lets go", () => {
    const first = holdMapPreview(1);
    const second = holdMapPreview(1);
    toggleMapPreview(1, "/a.mp3");
    first();
    expect(playingMapSet()).toBe(1);
    second();
    expect(playingMapSet()).toBeNull();
  });

  it("stopMapPreview stops whatever plays (route changes)", () => {
    toggleMapPreview(3, "/c.mp3");
    stopMapPreview();
    expect(playingMapSet()).toBeNull();
    stopMapPreview();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
  });
});
