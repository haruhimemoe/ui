/**
 * @file src/components/sortable/announcements.ts
 * @desc What a sortable list says in its live region, as functions of the moving item's label,
 *       1-based position, the total and the container's label (null with one container). The
 *       defaults are generic English; apps override any key. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** What every announcement gets. */
export type SortableAnnouncementInfo = {
  label: string;
  position: number;
  total: number;
  /** The container's label; null when the hook knows only one container. */
  container: string | null;
  /** "onto" containers: the label of the item under it, null for the container itself. */
  target?: string | null | undefined;
  /** Why a target is refused, when the app said. */
  reason?: string | undefined;
};

/** The strings and string builders a sortable list speaks. */
export type SortableAnnouncements = {
  instructions: string;
  handle: (label: string) => string;
  lifted: (info: SortableAnnouncementInfo) => string;
  over: (info: SortableAnnouncementInfo) => string;
  dropped: (info: SortableAnnouncementInfo) => string;
  refused: (info: SortableAnnouncementInfo) => string;
  cancelled: (info: SortableAnnouncementInfo) => string;
};

const place = ({ position, total, container }: SortableAnnouncementInfo): string =>
  `position ${position} of ${total}${container === null ? "" : ` in ${container}`}`;

const Place = (info: SortableAnnouncementInfo): string => {
  const text = place(info);
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
};

/** A reason without its closing punctuation, so it sits inside a sentence. */
const bare = (reason: string): string => reason.trim().replace(/[.!?]+$/, "");

/** The defaults: generic English, no site copy. */
export const DEFAULT_SORTABLE_ANNOUNCEMENTS: SortableAnnouncements = {
  instructions:
    "Press Space or Enter to pick up. Use the arrow keys to move, Space or Enter to drop, Escape to cancel.",
  handle: (label) => `Reorder ${label}`,
  lifted: (info) => `Picked up ${info.label}. ${Place(info)}.`,
  over: (info) => {
    const where =
      info.target === undefined
        ? place(info)
        : info.target === null
          ? `end of ${info.container ?? "the list"}`
          : `onto ${info.target}`;
    const why = info.reason ? ` Can't go there: ${bare(info.reason)}.` : "";
    return `${info.label}: ${where}.${why}`;
  },
  dropped: (info) => `Dropped ${info.label}. ${Place(info)}.`,
  refused: (info) =>
    `${info.label} can't go there${info.reason ? `: ${bare(info.reason)}` : ""}. Back at ${place(info)}.`,
  cancelled: (info) => `Cancelled. ${info.label} is back at ${place(info)}.`,
};

/**
 * @function resolveAnnouncements
 * @param overrides {Partial<SortableAnnouncements> | undefined} an app's own strings
 * @returns {SortableAnnouncements} the defaults with every defined override in place
 */
export function resolveAnnouncements(
  overrides: Partial<SortableAnnouncements> | undefined,
): SortableAnnouncements {
  const defined = Object.entries(overrides ?? {}).filter(([, value]) => value !== undefined);
  return { ...DEFAULT_SORTABLE_ANNOUNCEMENTS, ...Object.fromEntries(defined) };
}
