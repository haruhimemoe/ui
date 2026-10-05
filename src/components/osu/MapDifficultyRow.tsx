/**
 * @file src/components/osu/MapDifficultyRow.tsx
 * @desc One difficulty in a MapSetCard (internal, server-safe): its badges, the version (bold,
 *       linked by default), star pill and note, stats, details on the next line, then Copy ID
 *       (named with the version, since a set lists many) and the caller's actions.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import type { ReactNode } from "react";
import { AutoLink } from "../basics/AutoLink.js";
import { BeatmapStats } from "./BeatmapStats.js";
import { MapCopyIdButton } from "./MapCopyIdButton.js";
import type { MapStats } from "./mapCardView.js";
import { type MapCardLabels, shownNumber } from "./mapData.js";
import { beatmapPageUrl, isOsuId } from "./mapLinks.js";
import { StarRating } from "./StarRating.js";

/** One difficulty of a set. */
export type MapSetDifficulty = {
  beatmapId: number;
  version: string;
  stars?: number | null | undefined;
  starsNote?: ReactNode;
  starsLabel?: ReactNode;
  /** The star pill's hover title. */
  starsTitle?: string | undefined;
  stats?: MapStats | undefined;
  /** Default beatmapPageUrl(beatmapId); null = plain text. */
  href?: string | null | undefined;
  badges?: ReactNode;
  details?: ReactNode;
  actions?: ReactNode;
};

/**
 * @function MapDifficultyRow
 * @param props the difficulty, labels, copy flag and new-tab flag
 * @returns {JSX.Element} the difficulty's `<li>`
 */
export function MapDifficultyRow({
  diff: d,
  labels,
  copyId,
  newTab,
}: {
  diff: MapSetDifficulty;
  labels: MapCardLabels;
  copyId: boolean;
  newTab: boolean;
}) {
  const link =
    d.href === null
      ? null
      : (d.href ?? (isOsuId(d.beatmapId) ? beatmapPageUrl(d.beatmapId) : null));
  // See MapCardParts.MapTitle: aria-label (not a nested sr-only span) keeps the real space in
  // the accessible name.
  const tab = newTab
    ? ({
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `${d.version} (opens in a new tab)`,
      } as const)
    : {};
  return (
    <li data-beatmap-id={d.beatmapId} className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-c2 text-sm">
        {d.badges}
        <span className="font-bold text-c1">
          {link === null ? (
            d.version
          ) : (
            <AutoLink href={link} {...tab} className="hover:underline">
              {d.version}
            </AutoLink>
          )}
        </span>
        {shownNumber(d.stars) ? (
          <StarRating value={d.stars} label={d.starsLabel} title={d.starsTitle} />
        ) : null}
        {d.starsNote != null ? <span className="text-c3 text-xs">{d.starsNote}</span> : null}
        <BeatmapStats {...d.stats} />
      </div>
      {d.details ? <div className="text-c3 text-sm">{d.details}</div> : null}
      {copyId || d.actions ? (
        <div className="flex flex-wrap items-start gap-2">
          {copyId ? (
            <MapCopyIdButton
              beatmapId={d.beatmapId}
              label={labels.copyId}
              name={`${labels.copyIdName(d.beatmapId)} (${d.version})`}
              failedMessage={labels.copyFailed(d.beatmapId)}
            />
          ) : null}
          {d.actions}
        </div>
      ) : null}
    </li>
  );
}
