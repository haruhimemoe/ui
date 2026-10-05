/**
 * @file src/components/osu/MapSetCard.tsx
 * @desc One beatmapset and its difficulties: a header (cover square with an optional preview,
 *       "Artist - Title" linked to the set, status, badges, mapper, note) over a list of
 *       difficulty rows in the caller's order. Backgrounds apply to the header only. With
 *       copyId it is its own MapCopyScope (or joins the one it sits in). Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Surface } from "../basics/Surface.js";
import { Text } from "../basics/Text.js";
import { MapBackground, MapCoverSquare, MapStatusBadge, MapTitle } from "./MapCardParts.js";
import { MapCopyScope } from "./MapCopyScope.js";
import { MapDifficultyRow, type MapSetDifficulty } from "./MapDifficultyRow.js";
import { DEFAULT_MAP_LABELS, type MapCardLabels } from "./mapData.js";
import { beatmapsetPageUrl, isOsuId, MAP_STATUS_LABELS, mapCoverUrl } from "./mapLinks.js";

export type { MapSetDifficulty } from "./MapDifficultyRow.js";

/** Every native div prop except children, title and slot, plus the set and its difficulties. */
export type MapSetCardProps = Omit<ComponentProps<"div">, "children" | "title" | "slot"> & {
  as?: "div" | "li" | "article" | undefined;
  beatmapsetId: number;
  artist: string;
  title: string;
  creator?: string | null | undefined;
  status?: string | null | undefined;
  statusLabel?: string | undefined;
  badges?: ReactNode;
  note?: ReactNode;
  href?: string | null | undefined;
  newTab?: boolean | undefined;
  background?: "none" | "cover" | "blur" | undefined;
  coverUrl?: string | null | undefined;
  preview?: ReactNode;
  difficulties: readonly MapSetDifficulty[];
  copyId?: boolean | undefined;
  density?: "comfortable" | "compact" | undefined;
  emptyText?: ReactNode;
  labels?: Partial<MapCardLabels> | undefined;
};

/**
 * @function MapSetCard
 * @param props {MapSetCardProps} the set, its difficulties and how to draw them
 * @returns {JSX.Element} the set card
 */
export function MapSetCard({
  as = "div",
  beatmapsetId,
  artist,
  title,
  creator,
  status,
  statusLabel,
  badges,
  note,
  href,
  newTab = false,
  background = "none",
  coverUrl,
  preview,
  difficulties,
  copyId = false,
  density = "comfortable",
  emptyText = "No difficulties.",
  labels,
  className,
  ...props
}: MapSetCardProps) {
  const l = { ...DEFAULT_MAP_LABELS, ...labels };
  const song = `${artist} - ${title}`;
  const link =
    href === null
      ? null
      : (href ?? (isOsuId(beatmapsetId) ? beatmapsetPageUrl(beatmapsetId) : null));
  const square = coverUrl === null ? null : (coverUrl ?? mapCoverUrl(beatmapsetId, "list@2x"));
  const backgroundUrl =
    background === "none" || coverUrl === null
      ? null
      : (coverUrl ?? mapCoverUrl(beatmapsetId, "card@2x"));
  const statusKey = status?.trim() || null;
  const compact = density === "compact";
  const body = (
    <Surface
      as={as as "div"}
      className={cx("flex flex-col", compact ? "gap-2 px-3 py-2" : "gap-3", className)}
      {...props}
    >
      <div className="relative isolate flex gap-3 overflow-hidden rounded-md">
        {backgroundUrl ? <MapBackground url={backgroundUrl} blur={background === "blur"} /> : null}
        {coverUrl === null ? null : (
          <MapCoverSquare
            url={square}
            preview={preview}
            className={compact ? "size-8" : "size-12"}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <MapTitle
              as="p"
              text={song}
              tooltip={song}
              link={link}
              whole={false}
              newTab={newTab}
              className="font-bold"
            />
            {statusKey ? (
              <MapStatusBadge
                status={statusKey}
                text={statusLabel ?? MAP_STATUS_LABELS[statusKey] ?? statusKey}
              />
            ) : null}
            {badges}
          </div>
          {creator ? <p className="truncate text-c3 text-sm">{l.setMappedBy(creator)}</p> : null}
          {note ? <Text tone="warning">{note}</Text> : null}
        </div>
      </div>
      {difficulties.length === 0 ? (
        <Text tone="muted">{emptyText}</Text>
      ) : (
        <ul className={cx("flex flex-col", compact ? "gap-2" : "gap-3")}>
          {difficulties.map((diff) => (
            <MapDifficultyRow
              key={diff.beatmapId}
              diff={diff}
              labels={l}
              copyId={copyId}
              newTab={newTab}
            />
          ))}
        </ul>
      )}
    </Surface>
  );
  return copyId ? <MapCopyScope>{body}</MapCopyScope> : body;
}
