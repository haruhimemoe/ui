/**
 * @file src/remark/embedUrl.ts
 * @desc Reads a YouTube or Twitch URL into an embed target: the provider, the video, clip or
 *       channel id, and a YouTube start time. Anything else, including look-alike hosts and
 *       other schemes, is null. Never throws.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** A video the kit knows how to embed. */
export type EmbedTarget =
  | { provider: "youtube"; id: string; start?: number }
  | { provider: "twitch"; kind: "video" | "clip" | "channel"; id: string };

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);
const TWITCH_HOSTS = new Set(["twitch.tv", "www.twitch.tv", "m.twitch.tv"]);
const YOUTUBE_ID = /^[\w-]{11}$/;
const CHANNEL = /^\w{3,25}$/;
const CLIP = /^[\w-]+$/;
const TIME = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/;
/** First path segments on twitch.tv that are site pages, not channels. */
const NOT_CHANNELS = new Set([
  "directory",
  "downloads",
  "jobs",
  "login",
  "search",
  "settings",
  "signup",
  "subscriptions",
  "videos",
  "wallet",
  "inventory",
  "drops",
  "turbo",
  "store",
]);

const seconds = (value: string | null): number | undefined => {
  const match = value ? TIME.exec(value) : null;
  if (!match || (!match[1] && !match[2] && !match[3])) return undefined;
  const total = Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
  return total > 0 ? total : undefined;
};

const youtube = (url: URL, parts: string[]): EmbedTarget | null => {
  let id: string | null | undefined;
  if (url.hostname === "youtu.be") id = parts[0];
  else if (parts[0] === "watch") id = url.searchParams.get("v");
  else if (parts[0] === "shorts" || parts[0] === "live" || parts[0] === "embed") id = parts[1];
  if (!id || !YOUTUBE_ID.test(id)) return null;
  const start = seconds(url.searchParams.get("t") ?? url.searchParams.get("start"));
  return start ? { provider: "youtube", id, start } : { provider: "youtube", id };
};

const twitch = (parts: string[]): EmbedTarget | null => {
  const [first, second, third] = parts;
  if (!first) return null;
  if (first === "videos")
    return parts.length === 2 && second && /^\d+$/.test(second)
      ? { provider: "twitch", kind: "video", id: second }
      : null;
  if (parts.length === 3 && second === "clip" && third && CLIP.test(third))
    return { provider: "twitch", kind: "clip", id: third };
  if (parts.length === 1 && CHANNEL.test(first) && !NOT_CHANNELS.has(first.toLowerCase()))
    return { provider: "twitch", kind: "channel", id: first };
  return null;
};

/**
 * @function parseEmbedUrl
 * @param url {string} any string, usually a Markdown link's URL
 * @returns {EmbedTarget | null} the YouTube or Twitch target, or null for anything else
 */
export function parseEmbedUrl(url: string): EmbedTarget | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  const host = parsed.hostname.toLowerCase();
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (YOUTUBE_HOSTS.has(host) || host === "youtu.be") return youtube(parsed, parts);
  if (host === "clips.twitch.tv") {
    const slug = parts[0];
    return parts.length === 1 && slug && CLIP.test(slug)
      ? { provider: "twitch", kind: "clip", id: slug }
      : null;
  }
  if (TWITCH_HOSTS.has(host)) return twitch(parts);
  return null;
}
