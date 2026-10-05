/**
 * @file src/components/mdx/embedTargets.ts
 * @desc Pure URL builders for Embed and its client facade: default title, poster, watch page and
 *       player src. No cx, no React, so the client file can import it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { EmbedTarget } from "../../remark/embedUrl.js";

/**
 * @function defaultTitle
 * @param target {EmbedTarget} the parsed video
 * @returns {string} the provider's generic name ("YouTube video" or "Twitch video")
 */
export const defaultTitle = (target: EmbedTarget): string =>
  target.provider === "youtube" ? "YouTube video" : "Twitch video";

/**
 * @function posterUrl
 * @param target {EmbedTarget} the parsed video
 * @returns {string | null} YouTube's hqdefault thumbnail; Twitch has no keyless poster, so null
 */
export const posterUrl = (target: EmbedTarget): string | null =>
  target.provider === "youtube" ? `https://i.ytimg.com/vi/${target.id}/hqdefault.jpg` : null;

/**
 * @function watchUrl
 * @param target {EmbedTarget} the parsed video
 * @returns {string} the page the facade links to, which works with JS off
 */
export const watchUrl = (target: EmbedTarget): string => {
  if (target.provider === "youtube")
    return `https://www.youtube.com/watch?v=${target.id}${target.start ? `&t=${target.start}s` : ""}`;
  if (target.kind === "video") return `https://www.twitch.tv/videos/${target.id}`;
  if (target.kind === "clip") return `https://clips.twitch.tv/${target.id}`;
  return `https://www.twitch.tv/${target.id}`;
};

/**
 * @function embedSrc
 * @param target {EmbedTarget} the parsed video
 * @param parent {string} this page's hostname, which Twitch's player requires
 * @returns {string} the iframe src, autoplaying
 */
export const embedSrc = (target: EmbedTarget, parent: string): string => {
  if (target.provider === "youtube")
    return `https://www.youtube-nocookie.com/embed/${target.id}?autoplay=1${target.start ? `&start=${target.start}` : ""}`;
  const rest = `parent=${encodeURIComponent(parent)}&autoplay=true`;
  if (target.kind === "video") return `https://player.twitch.tv/?video=v${target.id}&${rest}`;
  if (target.kind === "channel") return `https://player.twitch.tv/?channel=${target.id}&${rest}`;
  return `https://clips.twitch.tv/embed?clip=${target.id}&${rest}`;
};
