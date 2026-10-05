/**
 * @file src/components/mdx/EmbedFacade.tsx
 * @desc Embed's click-to-load part. Before a click: a link to the watch page (opens YouTube or
 *       Twitch with JS off) holding the poster and a play glyph, so no third-party script, iframe
 *       or preconnect loads. A plain click swaps in the player iframe and focuses it; a modified
 *       click follows the link. Client file with finished class strings (no cx).
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import type { EmbedTarget } from "../../remark/embedUrl.js";
import { embedSrc } from "./embedTargets.js";

/** What Embed hands its facade: the parsed target, the name, the poster and the watch page. */
export type EmbedFacadeProps = {
  target: EmbedTarget;
  title: string;
  poster: string | null;
  watchUrl: string;
};

const LINK = "relative flex size-full items-center justify-center text-c1! no-underline!";
const POSTER = "absolute inset-0 size-full object-cover";
const PLAY =
  "relative flex size-16 items-center justify-center rounded-full bg-b6 text-2xl text-c1 shadow";
const NAME = "absolute right-3 bottom-3 left-3 truncate text-c1 text-sm";

/**
 * @function EmbedFacade
 * @param props {EmbedFacadeProps} the target, its title, an optional poster URL and the watch page
 * @returns {JSX.Element} the facade link, or the player iframe after a click
 */
export function EmbedFacade({ target, title, poster, watchUrl }: EmbedFacadeProps) {
  const [src, setSrc] = useState<string | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (src) frame.current?.focus();
  }, [src]);
  if (src) {
    return (
      <iframe
        ref={frame}
        src={src}
        title={title}
        className="size-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }
  const play = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    setSrc(embedSrc(target, window.location.hostname));
  };
  return (
    <a href={watchUrl} onClick={play} aria-label={`Play video: ${title}`} className={LINK}>
      {poster ? (
        // biome-ignore lint/performance/noImgElement: a third-party poster; next/image needs remotePatterns
        <img src={poster} alt="" loading="lazy" referrerPolicy="no-referrer" className={POSTER} />
      ) : null}
      <span aria-hidden="true" className={PLAY}>
        ▶
      </span>
      {poster ? null : <span className={NAME}>{title}</span>}
    </a>
  );
}
