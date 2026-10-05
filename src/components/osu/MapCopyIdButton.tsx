/**
 * @file src/components/osu/MapCopyIdButton.tsx
 * @desc Copy ID for MapCard and MapSetCard (internal): a secondary pill that copies the beatmap
 *       ID, its status before it in a box as wide as "Copied." so a press never moves it, and
 *       under it below the 2xl container width. Inside a MapCopyScope only the latest press
 *       keeps "Copied.". Finished class strings (no cx), because server components render it;
 *       a test pins MAP_COPY_BUTTON to buttonClasses' output.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import type { ReactNode } from "react";
import { RESERVED_STATUS, StatusOutput } from "../actions/StatusOutput.js";
import { useLatestStatus } from "../actions/useLatestStatus.js";
import { useMapCopyKey } from "./MapCopyScope.js";

/** buttonClasses({ variant: "secondary", className: "whitespace-nowrap" }), finished. */
export const MAP_COPY_BUTTON =
  "inline-flex w-fit items-center justify-center gap-2 rounded-full font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-h1 disabled:cursor-not-allowed disabled:opacity-50 forced-colors:border forced-colors:disabled:text-[GrayText] bg-b3 text-c1 not-disabled:hover:bg-b2 contrast-more:inset-ring contrast-more:inset-ring-c4 h-9 px-4 text-sm coarse:h-11 whitespace-nowrap";

const WRAPPER =
  "flex flex-col-reverse items-start gap-1 @2xl:flex-row @2xl:items-center @2xl:gap-2";

/** The beatmap ID, the button's text and name, and the status messages. */
export type MapCopyIdButtonProps = {
  beatmapId: number;
  label: ReactNode;
  /** The accessible name, naming the map ("Copy ID 129891"). */
  name: string;
  failedMessage: ReactNode;
  copiedMessage?: ReactNode;
};

type InnerProps = MapCopyIdButtonProps & { onPress: () => void };

function CopyId({
  beatmapId,
  label,
  name,
  failedMessage,
  copiedMessage = "Copied.",
  onPress,
}: InnerProps) {
  const { status, start, settle } = useLatestStatus<"copied" | "failed">();
  const copy = async () => {
    onPress();
    const run = start();
    try {
      await navigator.clipboard.writeText(String(beatmapId));
      settle(run, "copied");
    } catch {
      settle(run, "failed");
    }
  };
  return (
    <div className={WRAPPER}>
      <StatusOutput run={status?.run ?? null} className={RESERVED_STATUS}>
        {status?.result === "copied" ? copiedMessage : failedMessage}
      </StatusOutput>
      <button type="button" aria-label={name} onClick={copy} className={MAP_COPY_BUTTON}>
        {label}
      </button>
    </div>
  );
}

/**
 * @function MapCopyIdButton
 * @param props {MapCopyIdButtonProps} the beatmap ID, label, name and messages
 * @returns {JSX.Element} the Copy ID button and its status, keyed by the copy scope
 */
export function MapCopyIdButton(props: MapCopyIdButtonProps) {
  const { key, press } = useMapCopyKey();
  return <CopyId key={key} {...props} onPress={press} />;
}
