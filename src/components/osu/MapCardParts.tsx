/**
 * @file src/components/osu/MapCardParts.tsx
 * @desc The pieces MapCard and MapSetCard share (internal, server-safe): the title with its
 *       link, the status pill, the slot pill, the cover square that stacks a preview by grid,
 *       stars and stats, the cover background with its b5 overlay, and the loading bars.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { AutoLink } from "../basics/AutoLink.js";
import { Badge } from "../basics/Badge.js";
import { CardLink } from "../basics/CardLink.js";
import { BeatmapStats } from "./BeatmapStats.js";
import { MapCover } from "./MapCover.js";
import { ModBadge, type ModBadgeProps } from "./ModBadge.js";
import { StarRating } from "./StarRating.js";

/** A slot pill: its label, the mod that picks its color, a color override and a title. */
export type MapCardSlot = {
  label: string;
  mod?: string | undefined;
  color?: ModBadgeProps["color"] | undefined;
  title?: string | undefined;
};

/** Status pill colors; anything else is Badge's neutral. */
export const STATUS_CLASSES: Readonly<Record<string, string>> = {
  ranked: "bg-lime-300 text-b6",
  approved: "bg-lime-300 text-b6",
  loved: "bg-pink-300 text-b6",
  qualified: "bg-sky-300 text-b6",
  pending: "bg-amber-300 text-b6",
  wip: "bg-amber-300 text-b6",
  graveyard: "bg-b6 text-c3",
};

const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * @function MapTitle
 * @param props the element, text, tooltip, link, whole-card flag, new-tab flag and classes
 * @returns {JSX.Element} the title, its text linked (a CardLink for whole-card links)
 */
export function MapTitle({
  as: Tag,
  text,
  tooltip,
  link,
  whole,
  newTab,
  className,
}: {
  as: "p" | "h2" | "h3" | "h4";
  text: string;
  tooltip: string;
  link: string | null;
  whole: boolean;
  newTab: boolean;
  className?: string | undefined;
}) {
  // aria-label carries the exact wording (with a real space) straight into the accessible
  // name: a sr-only text node beside the link's own text gets trimmed and joined with no
  // separator by the accessible-name computation, so "DiVE" and "(opens" would run together.
  const tab = newTab ? { ...NEW_TAB, "aria-label": `${text} (opens in a new tab)` } : {};
  return (
    <Tag title={tooltip} className={cx("min-w-0 truncate text-c1", className)}>
      {link === null ? (
        text
      ) : whole ? (
        <CardLink href={link} {...tab}>
          {text}
        </CardLink>
      ) : (
        <AutoLink href={link} {...tab} className="hover:underline">
          {text}
        </AutoLink>
      )}
    </Tag>
  );
}

/**
 * @function MapStatusBadge
 * @param props {{ status: string; text: string }} the osu! status and its words
 * @returns {JSX.Element} a Badge in the status's color
 */
export function MapStatusBadge({ status, text }: { status: string; text: string }) {
  return <Badge className={STATUS_CLASSES[status]}>{text}</Badge>;
}

/**
 * @function MapSlotBadge
 * @param props {{ slot: MapCardSlot }} the slot
 * @returns {JSX.Element} the slot's ModBadge
 */
export function MapSlotBadge({ slot }: { slot: MapCardSlot }) {
  return (
    <ModBadge mod={slot.mod ?? slot.label} color={slot.color} title={slot.title}>
      {slot.label}
    </ModBadge>
  );
}

/**
 * @function MapCoverSquare
 * @param props the cover URL (null: placeholder), a preview button, a pill and size classes
 * @returns {JSX.Element} one grid cell stacking the cover, the preview and the pill
 */
export function MapCoverSquare({
  url,
  preview,
  badge,
  className,
}: {
  url: string | null;
  preview?: ReactNode;
  badge?: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className={cx("grid shrink-0 overflow-hidden rounded-md *:[grid-area:1/1]", className)}>
      <MapCover src={url ?? undefined} beatmapsetId={null} className="size-full" />
      {preview}
      {badge ? (
        <span className="pointer-events-none m-1 self-start justify-self-start rounded-full bg-b6/70 p-0.5">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

/**
 * @function MapFacts
 * @param props stars, stats, the star pill's label, note and title, and layout flags
 * @returns {JSX.Element} the star pill, its note and BeatmapStats on one line
 */
export function MapFacts({
  stars,
  stats,
  starsLabel,
  starsNote,
  starsTitle,
  overCover,
  compact,
}: {
  stars: number | null;
  stats: Record<"cs" | "ar" | "od" | "hp" | "bpm" | "lengthSeconds", number | null>;
  starsLabel?: ReactNode;
  starsNote?: ReactNode;
  starsTitle?: string | undefined;
  overCover: boolean;
  compact: boolean;
}) {
  return (
    <div
      className={cx(
        "mt-1 flex items-center gap-2",
        compact ? "min-w-0 flex-nowrap overflow-hidden whitespace-nowrap" : "flex-wrap",
      )}
    >
      {stars !== null ? <StarRating value={stars} label={starsLabel} title={starsTitle} /> : null}
      {starsNote != null ? <span className="text-c3 text-xs">{starsNote}</span> : null}
      <BeatmapStats
        {...stats}
        className={cx(compact && "flex-nowrap", overCover && "[&_dt]:text-c3")}
      />
    </div>
  );
}

/**
 * @function MapBackground
 * @param props {{ url: string; blur: boolean }} the wide cover and whether to blur it
 * @returns {JSX.Element} the cover behind everything and its b5 overlay, both hidden in forced
 *          colors so text sits on the system Canvas
 */
export function MapBackground({ url, blur }: { url: string; blur: boolean }) {
  return (
    <>
      {/* biome-ignore lint/performance/noImgElement: plain img so apps need no remotePatterns */}
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        className={cx(
          "absolute inset-0 -z-10 size-full object-cover forced-colors:hidden",
          blur && "scale-110 blur-xl",
        )}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-b5/80 forced-colors:hidden" />
    </>
  );
}

/**
 * @function MapSkeleton
 * @param props {{ compact: boolean }} one bar when compact, two otherwise
 * @returns {JSX.Element} decorative loading bars that pulse only under motion-safe
 */
export function MapSkeleton({ compact }: { compact: boolean }) {
  const bar = "block h-2.5 max-w-full rounded bg-b3 motion-safe:animate-pulse";
  return (
    <span aria-hidden="true" className="mt-1 flex flex-col gap-1.5">
      <span className={`${bar} w-48`} />
      {compact ? null : <span className={`${bar} w-32`} />}
    </span>
  );
}
