/**
 * @file src/components/osu/PlayerCard.tsx
 * @desc osu!-web's user card (the 120px card from the friends list and user tooltips) from plain
 *       props: cover under a b5 overlay, 60px avatar, country flag, team flag and supporter heart,
 *       the username (the whole card links to the profile), and an optional status row. It never
 *       fetches: the app passes a snapshot, so nothing here claims live data unless told to. The
 *       online ring's lime is osu!'s own green-light, hue-independent like StarRating's spectrum.
 *       Keyboard focus outlines the whole card in h1 as well as the username's own ring.
 *       Plain `<img>`s, not next/image, so apps need no `images.remotePatterns` for osu!'s hosts.
 *       Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { AutoLink } from "../basics/AutoLink.js";
import {
  avatarUrl as defaultAvatarUrl,
  countryName as defaultCountryName,
  flagUrl,
  isAnimatedImage,
  normalizeCountryCode,
  profileUrl,
} from "./playerLinks.js";

/** An osu! team: its name (the flag's alt text and tooltip) and its flag image. */
export type PlayerTeam = {
  /** The team's name. */
  name: string;
  /** The team flag's URL (osu! serves them from assets.ppy.sh). */
  flagUrl: string;
};

/** Every native `<div>` prop except children, plus the player's snapshot. */
export type PlayerCardProps = Omit<ComponentProps<"div">, "children"> & {
  /** The name shown on the card, as-is. */
  username: string;
  /** The osu! user id: the avatar comes from a.ppy.sh and the card links to the profile. */
  userId?: number | undefined;
  /** Replaces the profile link; `null` draws no link even with a `userId`. */
  href?: string | null | undefined;
  /** Replaces the a.ppy.sh avatar. Without it and a `userId`, a letter stands in. */
  avatarUrl?: string | undefined;
  /** The profile cover, drawn behind everything. None leaves the card plain b4. */
  coverUrl?: string | undefined;
  /** ISO 3166-1 alpha-2 code; draws osu!'s flag. Anything else draws none. */
  countryCode?: string | undefined;
  /** The flag's alt text (default: the English name from Intl, else the code). */
  countryName?: string | undefined;
  /** The player's osu! team, drawn as its flag beside the country's. */
  team?: PlayerTeam | undefined;
  /** Draws the supporter heart. */
  supporter?: boolean | undefined;
  /** What screen readers hear for the heart (default "osu! supporter"). */
  supporterLabel?: string | undefined;
  /** Draws the status ring. Leave it out for static data: the card never guesses a status. */
  status?: "online" | "offline" | undefined;
  /** The bottom row's main line (default "Online" or "Offline" when `status` is set). */
  statusText?: ReactNode;
  /** A small line above it ("Last seen 29 days ago", "formerly RMarc"). */
  statusNote?: ReactNode;
};

/** The first letter or digit of a name, for the stand-in avatar. */
function initialOf(name: string): string {
  return name.match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ?? "?";
}

/** Whether a status line has something to show: not null, undefined, a boolean or "". */
function shown(node: ReactNode): boolean {
  return node != null && typeof node !== "boolean" && node !== "";
}

/** The supporter heart: osu!'s pink-circle badge with a white heart. */
function SupporterHeart({ label }: { label: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex size-[26px] shrink-0 items-center justify-center rounded-full bg-h2 text-c1"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
        <path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.2 4.5 6 4.5c2.2 0 3.6 1.2 4.5 2.5l1.5 2 1.5-2c.9-1.3 2.3-2.5 4.5-2.5 3.8 0 5.7 3.9 4 7.2C19.5 16.4 12 21 12 21z" />
      </svg>
    </span>
  );
}

/**
 * @function PlayerCard
 * @param props {PlayerCardProps} the player's snapshot (name, id, cover, flags, supporter,
 *        status) and native div props
 * @returns {JSX.Element} a 120px osu!-web user card; the whole card links to the profile when it
 *          has a link
 */
export function PlayerCard({
  username,
  userId,
  href,
  avatarUrl,
  coverUrl,
  countryCode,
  countryName,
  team,
  supporter = false,
  supporterLabel = "osu! supporter",
  status,
  statusText,
  statusNote,
  className,
  ...props
}: PlayerCardProps) {
  const link = href === null ? null : (href ?? (userId === undefined ? null : profileUrl(userId)));
  const avatar = avatarUrl ?? (userId === undefined ? null : defaultAvatarUrl(userId));
  const code = normalizeCountryCode(countryCode);
  const flag = flagUrl(countryCode);
  const mainLine = shown(statusText)
    ? statusText
    : status === "online"
      ? "Online"
      : status
        ? "Offline"
        : null;
  const note = shown(statusNote) ? statusNote : null;
  const hasStatusRow = status !== undefined || mainLine !== null || note !== null;

  return (
    <div
      className={cx(
        "relative isolate flex h-[120px] flex-col justify-between overflow-hidden rounded-[10px] bg-b4 text-c1",
        link &&
          "hover:outline-2 hover:outline-c3 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-h1",
        className,
      )}
      {...props}
    >
      {coverUrl ? (
        // biome-ignore lint/performance/noImgElement: plain img so apps need no remotePatterns
        <img
          src={coverUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className={cx(
            "absolute inset-0 -z-10 size-full object-cover",
            isAnimatedImage(coverUrl) && "motion-reduce:hidden",
          )}
        />
      ) : null}
      {coverUrl ? <div aria-hidden="true" className="absolute inset-0 -z-10 bg-b5/80" /> : null}

      <div className="flex gap-2.5 p-2.5">
        {avatar ? (
          // biome-ignore lint/performance/noImgElement: plain img so apps need no remotePatterns
          <img
            src={avatar}
            alt=""
            width={60}
            height={60}
            loading="lazy"
            decoding="async"
            className="size-[60px] shrink-0 rounded-md bg-b4 object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-[60px] shrink-0 items-center justify-center rounded-md bg-b3 font-bold text-2xl text-c3"
          >
            {initialOf(username)}
          </span>
        )}
        <div className="grid min-w-0 flex-1 grid-rows-[26px_1fr]">
          <div className="flex h-[26px] items-center gap-1.5">
            {flag && code ? (
              // biome-ignore lint/performance/noImgElement: plain img so apps need no remotePatterns
              <img
                src={flag}
                alt={countryName ?? defaultCountryName(code)}
                width={36}
                height={26}
                loading="lazy"
                decoding="async"
                className="h-[26px] w-auto shrink-0"
              />
            ) : null}
            {team ? (
              // biome-ignore lint/performance/noImgElement: plain img so apps need no remotePatterns
              <img
                src={team.flagUrl}
                alt={team.name}
                width={52}
                height={26}
                loading="lazy"
                decoding="async"
                className="h-[26px] w-[52px] shrink-0 rounded-sm object-cover"
              />
            ) : null}
            {supporter ? <SupporterHeart label={supporterLabel} /> : null}
          </div>
          <div className="flex min-w-0 items-center">
            {link ? (
              <AutoLink
                href={link}
                className="truncate font-semibold text-base text-c1 after:absolute after:inset-0"
              >
                {username}
              </AutoLink>
            ) : (
              <span className="truncate font-semibold text-base">{username}</span>
            )}
          </div>
        </div>
      </div>

      {hasStatusRow ? (
        <div className="flex items-center gap-2.5 px-2.5 pb-2.5">
          <div className="flex w-[60px] shrink-0 justify-center">
            {status ? (
              <span
                aria-hidden="true"
                className={cx(
                  "size-[25px] rounded-full border-4",
                  status === "online" ? "border-lime-400" : "border-b6",
                )}
              />
            ) : null}
          </div>
          <div className="flex min-w-0 flex-col">
            {note !== null ? <span className="truncate text-c2 text-xs">{note}</span> : null}
            {mainLine !== null ? <span className="truncate text-sm">{mainLine}</span> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
