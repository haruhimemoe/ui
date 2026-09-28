/**
 * @file src/components/osu/BeatmapStats.tsx
 * @desc A beatmap's CS / AR / OD / HP / BPM / length as a compact description list (the packs
 *       and pools map rows). Takes plain numbers, so it needs no osu! types; a stat left out or
 *       not finite doesn't show. The short names are `<abbr>`s with the full name as a title.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../utils/cx.js";

/** The stats BeatmapStats shows, in order. */
export type BeatmapStatKey = "cs" | "ar" | "od" | "hp" | "bpm" | "length";

/** Every native `<dl>` prop except children, plus the numbers and optional labels. */
export type BeatmapStatsProps = Omit<ComponentProps<"dl">, "children"> & {
  /** Circle size. */
  cs?: number | null | undefined;
  /** Approach rate. */
  ar?: number | null | undefined;
  /** Overall difficulty. */
  od?: number | null | undefined;
  /** HP drain. */
  hp?: number | null | undefined;
  /** Beats per minute, shown whole. */
  bpm?: number | null | undefined;
  /** Drain length in seconds, shown as m:ss (h:mm:ss from an hour). */
  lengthSeconds?: number | null | undefined;
  /** Replaces a stat's label (to translate it, say). */
  labels?: Partial<Record<BeatmapStatKey, ReactNode>> | undefined;
};

const abbr = (short: string, full: string) => <abbr title={full}>{short}</abbr>;

const LABELS: Record<BeatmapStatKey, ReactNode> = {
  cs: abbr("CS", "Circle size"),
  ar: abbr("AR", "Approach rate"),
  od: abbr("OD", "Overall difficulty"),
  hp: abbr("HP", "HP drain"),
  bpm: abbr("BPM", "Beats per minute"),
  length: "Length",
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * @function formatLength
 * @param seconds {number} a length in seconds
 * @returns {string} "m:ss", or "h:mm:ss" from an hour up
 */
const formatLength = (seconds: number): string => {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(total % 60)}`
    : `${minutes}:${pad(total % 60)}`;
};

// One decimal at most, with float noise gone (9.300000001 is 9.3).
const stat = (n: number) => String(Math.round(n * 10) / 10);

/**
 * @function BeatmapStats
 * @param props {BeatmapStatsProps} the stats as numbers, optional labels, and native dl props
 * @returns {JSX.Element} a wrapping `<dl>` of label and value pairs, in CS, AR, OD, HP, BPM,
 *          length order
 */
export function BeatmapStats({
  cs,
  ar,
  od,
  hp,
  bpm,
  lengthSeconds,
  labels,
  className,
  ...props
}: BeatmapStatsProps) {
  const values: [BeatmapStatKey, number | null | undefined, (n: number) => string][] = [
    ["cs", cs, stat],
    ["ar", ar, stat],
    ["od", od, stat],
    ["hp", hp, stat],
    ["bpm", bpm, (n) => String(Math.round(n))],
    ["length", lengthSeconds, formatLength],
  ];
  return (
    <dl className={cx("flex flex-wrap gap-x-3 gap-y-1 text-xs", className)} {...props}>
      {values.map(([key, value, format]) =>
        typeof value === "number" && Number.isFinite(value) ? (
          <div key={key} className="flex gap-1">
            <dt className="text-c4">{labels?.[key] ?? LABELS[key]}</dt>
            <dd className="font-bold text-c1 tabular-nums">{format(value)}</dd>
          </div>
        ) : null,
      )}
    </dl>
  );
}
