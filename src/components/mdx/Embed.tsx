/**
 * @file src/components/mdx/Embed.tsx
 * @desc A YouTube or Twitch video in a 16:9 box that loads nothing from the provider until the
 *       reader clicks play (see EmbedFacade). The poster, a YouTube thumbnail by default, is the
 *       one third-party request; `poster={false}` or a local poster removes it. A URL that isn't
 *       a known video renders as a plain external link, never an iframe. Server component.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps } from "react";
import { parseEmbedUrl } from "../../remark/embedUrl.js";
import { cx } from "../../utils/cx.js";
import { EmbedFacade } from "./EmbedFacade.js";
import { defaultTitle, posterUrl, watchUrl } from "./embedTargets.js";
import { MdxLink } from "./MdxLink.js";

/** Native div props for the box, plus the video URL, its name and the poster. */
export type EmbedProps = Omit<ComponentProps<"div">, "children"> & {
  /** A YouTube or Twitch URL, read by parseEmbedUrl. */
  url: string;
  /** The iframe title and the play link's name. Default "YouTube video" / "Twitch video". */
  title?: string | undefined;
  /** A poster image URL; YouTube defaults to its thumbnail, Twitch to none. false draws none. */
  poster?: string | false | undefined;
};

/**
 * @function Embed
 * @param props {EmbedProps} the URL, an optional title and poster, and native div props
 * @returns {JSX.Element} the click-to-load player box, or a plain link for an unknown URL
 */
export function Embed({ url, title, poster, className, ...props }: EmbedProps) {
  const target = parseEmbedUrl(url);
  if (!target) {
    return (
      <div className={className} {...props}>
        <MdxLink href={url}>{title ?? url}</MdxLink>
      </div>
    );
  }
  const image = poster === false ? null : (poster ?? posterUrl(target));
  return (
    <div className={cx("mt-4 aspect-video overflow-hidden rounded-md bg-b6", className)} {...props}>
      <EmbedFacade
        target={target}
        title={title ?? defaultTitle(target)}
        poster={image}
        watchUrl={watchUrl(target)}
      />
    </div>
  );
}
