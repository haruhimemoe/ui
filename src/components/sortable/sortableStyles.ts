/**
 * @file src/components/sortable/sortableStyles.ts
 * @desc The drop indicator's class strings, for apps that use useSortable directly
 *       (SortableList applies them itself). Keyed off the data attributes the props getters
 *       set: a 2px h1 line in a before: pseudo-element, centred in the container's
 *       --sortable-gap (default 0), on the side data-sortable-line names; a dashed h1 outline
 *       for an "onto" item or an "inside" container; c4 for refused targets and the lifted
 *       item. No opacity on the lifted row (the house rule against opacity on text). The line
 *       fades in on the motion tokens. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** For each item element: the line, the onto outline and the lifted look. */
export const SORTABLE_ITEM = [
  "relative",
  "before:pointer-events-none before:absolute before:border-h1 before:opacity-0 before:content-['']",
  "motion-safe:before:transition-opacity before:duration-short before:ease-standard",
  "forced-colors:before:border-[Highlight]",
  "data-[sortable-line]:before:opacity-100",
  "data-[sortable-refused]:before:border-c4",
  "data-[sortable-line=top]:before:inset-x-0 data-[sortable-line=top]:before:top-[calc(var(--sortable-gap,0px)/-2_-_1px)] data-[sortable-line=top]:before:border-t-2",
  "data-[sortable-line=bottom]:before:inset-x-0 data-[sortable-line=bottom]:before:bottom-[calc(var(--sortable-gap,0px)/-2_-_1px)] data-[sortable-line=bottom]:before:border-t-2",
  "data-[sortable-line=left]:before:inset-y-0 data-[sortable-line=left]:before:left-[calc(var(--sortable-gap,0px)/-2_-_1px)] data-[sortable-line=left]:before:border-l-2",
  "data-[sortable-line=right]:before:inset-y-0 data-[sortable-line=right]:before:right-[calc(var(--sortable-gap,0px)/-2_-_1px)] data-[sortable-line=right]:before:border-l-2",
  "data-[sortable-drop=onto]:outline-2 data-[sortable-drop=onto]:outline-h1 data-[sortable-drop=onto]:outline-offset-2 data-[sortable-drop=onto]:outline-dashed",
  "data-[sortable-refused]:data-[sortable-drop=onto]:outline-c4",
  "data-[sortable-state=lifted]:outline-2 data-[sortable-state=lifted]:outline-c4 data-[sortable-state=lifted]:outline-offset-2 data-[sortable-state=lifted]:outline-dashed",
].join(" ");

/** For each container element: the outline while it is the target itself. */
export const SORTABLE_CONTAINER = [
  "data-[sortable-drop=inside]:outline-2 data-[sortable-drop=inside]:outline-h1 data-[sortable-drop=inside]:outline-offset-2 data-[sortable-drop=inside]:outline-dashed",
  "data-[sortable-refused]:data-[sortable-drop=inside]:outline-c4",
].join(" ");
