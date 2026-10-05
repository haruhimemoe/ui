/**
 * @file src/components/osu/MapCard.tsx
 * @desc One map from plain props, as a row (packs' slot row) or a card (osu-web's panel):
 *       title "Artist - Title" linked to osu!, "[version] mapped by", stars and stats, an
 *       optional slot pill, status, cover, preview, Copy ID and the caller's slots. It never
 *       fetches: `map` takes BeatmapMeta-shaped data as-is. States: loading (skeleton, busy),
 *       missing and error (the message), ready. Server-safe; Copy ID is its own client file.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Surface } from "../basics/Surface.js";
import { CARD_LINK_LIFT } from "../basics/surfaceStyles.js";
import { Text } from "../basics/Text.js";
import {
  MapBackground,
  type MapCardSlot,
  MapFacts,
  MapSkeleton,
  MapSlotBadge,
  MapStatusBadge,
  MapTitle,
} from "./MapCardParts.js";
import { type MapCardLayoutParts, MapCardRow } from "./MapCardRow.js";
import { MapCopyIdButton } from "./MapCopyIdButton.js";
import { type MapStats, mapCardView } from "./mapCardView.js";
import type { MapCardLabels, MapData } from "./mapData.js";

/** Every native div prop except children and title, plus the map and how to draw it. */
export type MapCardProps = Omit<ComponentProps<"div">, "children" | "title" | "slot"> & {
  as?: "div" | "li" | "article" | undefined;
  beatmapId: number;
  map?: MapData | null | undefined;
  state?: "ready" | "loading" | "missing" | "error" | undefined;
  message?: ReactNode;
  layout?: "row" | "card" | undefined;
  background?: "none" | "cover" | "blur" | undefined;
  density?: "comfortable" | "compact" | undefined;
  coverUrl?: string | null | undefined;
  slot?: MapCardSlot | undefined;
  stars?: number | null | undefined;
  starsLabel?: ReactNode;
  starsNote?: ReactNode;
  /** The star pill's hover title (packs' "rating with mods" note). */
  starsTitle?: string | undefined;
  stats?: MapStats | undefined;
  showStatus?: boolean | undefined;
  statusLabel?: string | undefined;
  href?: string | null | undefined;
  newTab?: boolean | undefined;
  wholeCardLink?: boolean | undefined;
  copyId?: boolean | undefined;
  titleAs?: "p" | "h2" | "h3" | "h4" | undefined;
  leading?: ReactNode;
  preview?: ReactNode;
  badges?: ReactNode;
  details?: ReactNode;
  actions?: ReactNode;
  labels?: Partial<MapCardLabels> | undefined;
};

const WHOLE_CARD = `${CARD_LINK_LIFT} hover:outline-2 hover:outline-c3 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-h1`;

/**
 * @function MapCard
 * @param props {MapCardProps} the beatmap id, its data, state, layout and slots
 * @returns {JSX.Element} the map as a row or a card
 */
export function MapCard({
  as = "div",
  beatmapId,
  map,
  state = "ready",
  message,
  layout = "row",
  background = "none",
  density = "comfortable",
  coverUrl,
  slot,
  stars,
  starsLabel,
  starsNote,
  starsTitle,
  stats,
  showStatus,
  statusLabel,
  href,
  newTab = false,
  wholeCardLink,
  copyId = false,
  titleAs = "p",
  leading,
  preview,
  badges,
  details,
  actions,
  labels,
  className,
  ...props
}: MapCardProps) {
  const card = layout === "card";
  const compact = density === "compact";
  const view = mapCardView({
    beatmapId,
    map,
    state,
    layout,
    background,
    coverUrl,
    stars,
    stats,
    showStatus,
    statusLabel,
    href,
    wholeCardLink,
    labels,
  });
  const l = view.labels;
  const byline =
    view.version !== null || view.creator !== null ? (
      <>
        {view.version !== null ? `[${view.version}] ` : null}
        {view.creator !== null ? l.mappedBy(view.creator) : null}
      </>
    ) : null;
  const failure =
    state === "error" ? (message ?? null) : state === "missing" ? l.missing(beatmapId) : null;
  const parts: MapCardLayoutParts = {
    compact,
    square: view.square,
    leading,
    preview,
    badges,
    details,
    actions,
    title: (
      <MapTitle
        as={titleAs}
        text={card ? view.songTitle : view.fullTitle}
        tooltip={view.fullTitle}
        link={view.link}
        whole={view.whole}
        newTab={newTab}
        className={card ? "font-semibold" : compact ? "font-bold text-sm" : "font-bold"}
      />
    ),
    artist: card ? view.artist : null,
    byline,
    slot: slot ? <MapSlotBadge slot={slot} /> : null,
    status:
      view.status !== null && view.statusText !== null ? (
        <MapStatusBadge status={view.status} text={view.statusText} />
      ) : null,
    body: (
      <>
        {view.skeleton ? <MapSkeleton compact={compact} /> : null}
        {view.loading ? <span className="sr-only">{l.loading(beatmapId)}</span> : null}
        {failure !== null ? <Text tone="error">{failure}</Text> : null}
        {!view.failed && (view.hasFacts || starsNote != null) ? (
          <MapFacts
            stars={view.stars}
            stats={view.stats}
            starsLabel={starsLabel}
            starsNote={starsNote}
            starsTitle={starsTitle}
            overCover={view.backgroundUrl !== null}
            compact={compact}
          />
        ) : null}
      </>
    ),
    copy: copyId ? (
      <MapCopyIdButton
        beatmapId={beatmapId}
        label={l.copyId}
        name={l.copyIdName(beatmapId)}
        failedMessage={l.copyFailed(beatmapId)}
      />
    ) : null,
  };
  return (
    <Surface
      as={as as "div"}
      aria-busy={view.loading ? true : undefined}
      className={cx(
        "@container relative isolate",
        compact && "px-3 py-2",
        view.whole && WHOLE_CARD,
        className,
      )}
      {...props}
    >
      {view.backgroundUrl !== null ? (
        <MapBackground url={view.backgroundUrl} blur={background === "blur"} />
      ) : null}
      <MapCardRow parts={parts} />
    </Surface>
  );
}
