/**
 * @file tests/remark/embedUrl.test.ts
 * @desc Tests for parseEmbedUrl: every YouTube URL form with start times, Twitch videos, clips
 *       and channels, and junk (bad ids, look-alike hosts, other schemes) returning null.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { parseEmbedUrl } from "../../src/remark/embedUrl.js";

const ID = "dQw4w9WgXcQ";

describe("parseEmbedUrl", () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&list=PL1`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
  ])("reads YouTube %s", (url) => {
    expect(parseEmbedUrl(url)).toEqual({ provider: "youtube", id: ID });
  });

  it.each([
    [`https://youtu.be/${ID}?t=90`, 90],
    [`https://www.youtube.com/watch?v=${ID}&t=1m30s`, 90],
    [`https://www.youtube.com/watch?v=${ID}&t=1h`, 3600],
    [`https://www.youtube.com/embed/${ID}?start=42`, 42],
  ])("reads the start time of %s", (url, start) => {
    expect(parseEmbedUrl(url)).toEqual({ provider: "youtube", id: ID, start });
  });

  it("ignores a start time it can't read", () => {
    expect(parseEmbedUrl(`https://youtu.be/${ID}?t=soon`)).toEqual({ provider: "youtube", id: ID });
  });

  it.each([
    [
      "https://www.twitch.tv/videos/2245123456",
      { provider: "twitch", kind: "video", id: "2245123456" },
    ],
    [
      "https://clips.twitch.tv/BraveTenseClipKappa-abc_12",
      { provider: "twitch", kind: "clip", id: "BraveTenseClipKappa-abc_12" },
    ],
    [
      "https://www.twitch.tv/osulive/clip/FunnyClip-x1",
      { provider: "twitch", kind: "clip", id: "FunnyClip-x1" },
    ],
    ["https://www.twitch.tv/osulive", { provider: "twitch", kind: "channel", id: "osulive" }],
  ])("reads Twitch %s", (url, target) => {
    expect(parseEmbedUrl(url)).toEqual(target);
  });

  it.each([
    `https://www.youtube.com/watch?v=${ID.slice(1)}`,
    `https://www.youtube.com/watch?v=${ID}x`,
    `https://youtube.com.evil.example/watch?v=${ID}`,
    `javascript:alert(1)//youtu.be/${ID}`,
    "https://www.twitch.tv/directory",
    "https://www.twitch.tv/ab",
    "https://www.twitch.tv/videos/abc",
    "https://vimeo.com/123",
    "not a url",
    "",
  ])("returns null for %s", (url) => {
    expect(parseEmbedUrl(url)).toBeNull();
  });
});
