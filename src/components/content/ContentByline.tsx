/**
 * @file src/components/content/ContentByline.tsx
 * @desc ContentPage's author line: each author's name, linked to an osu! profile from a userId
 *       (or a given href, or unlinked), with a 20px avatar when one can be drawn. Names join
 *       "A, B and C". Split out of ContentPage.tsx to keep that file under 200 lines. Server-safe:
 *       no state, no browser APIs.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { Fragment } from "react";
import { MdxLink } from "../mdx/MdxLink.js";
import { avatarUrl as osuAvatarUrl, profileUrl } from "../osu/playerLinks.js";

/** A page author: a name, and an osu! id or a link and avatar of their own. */
export type ContentAuthor = {
  name: string;
  /** osu! user id: links the profile and draws the avatar unless href / avatarUrl say otherwise. */
  userId?: number | undefined;
  /** Where the name links; null for no link. Default the osu! profile when userId is set. */
  href?: string | null | undefined;
  avatarUrl?: string | undefined;
};

const ITEM = "inline-flex items-center gap-1";

function Author({ author }: { author: ContentAuthor }) {
  const image =
    author.avatarUrl ?? (author.userId === undefined ? undefined : osuAvatarUrl(author.userId));
  const href =
    author.href !== undefined
      ? author.href
      : author.userId === undefined
        ? null
        : profileUrl(author.userId);
  const body = (
    <>
      {image ? (
        // biome-ignore lint/performance/noImgElement: plain img so apps need no remotePatterns
        <img src={image} alt="" width={20} height={20} className="size-5 rounded" />
      ) : null}
      {author.name}
    </>
  );
  return href ? (
    <MdxLink href={href} className={`${ITEM} text-c2 underline hover:text-c1`}>
      {body}
    </MdxLink>
  ) : (
    <span className={ITEM}>{body}</span>
  );
}

/**
 * @function ContentByline
 * @param props {{ authors: readonly ContentAuthor[] }} one or more authors
 * @returns {JSX.Element} the names, each with a 20px avatar when known, joined "A, B and C"
 */
export function ContentByline({ authors }: { authors: readonly ContentAuthor[] }) {
  return (
    <span>
      {authors.map((author, index) => (
        <Fragment key={`${author.userId ?? ""}${author.name}`}>
          {index === 0 ? null : index === authors.length - 1 ? " and " : ", "}
          <Author author={author} />
        </Fragment>
      ))}
    </span>
  );
}
