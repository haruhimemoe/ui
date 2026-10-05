/**
 * @file src/components/sortable/sortableTypes.ts
 * @desc The sortable lists' public types: the move an app gets, the hook's options and what it
 *       returns, and the props objects the getters build for containers, items and handles.
 *       Types only, so the directive-less components can import them. Server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import type { SortableAnnouncements } from "./announcements.js";
import type { SortableAxis, SortableMode } from "./sortableMath.js";

/** A container and an index in it. */
export type SortablePlace = { container: string; index: number };

/** One move, reported to the app. The hook never reorders anything itself. */
export type SortableMove = {
  id: string;
  from: SortablePlace;
  /**
   * "between" containers: the index the item will have in `to.container` after the move
   * (already adjusted when it moves down inside its own container; the same meaning as
   * @haruhimemoe/pool's moveBucket `to`).
   * "onto" containers: the index of the item it was dropped on, or the container's length when
   * it was dropped on the container's own space.
   */
  to: SortablePlace;
  /** "onto" containers: the id of the item it was dropped on, null for the container. Always null for "between". */
  onto: string | null;
  via: "pointer" | "keyboard" | "button";
};

/** true or undefined: accepted. false: refused. A string: refused, and it is the reason (announced). */
export type SortableResult = boolean | string | undefined;

export type UseSortableOptions = {
  /**
   * Called once per drop or button move. May return a promise (server reorders). Returning
   * nothing (an arrow that only calls setState) counts as accepted.
   */
  // biome-ignore lint/suspicious/noConfusingVoidType: `=> setItems(...)` returns void; TypeScript only accepts it with void in the union.
  onMove: (move: SortableMove) => SortableResult | void | Promise<SortableResult | void>;
  /** Checked while hovering and on each keyboard step: refused targets look refused and say why. */
  canDrop?: ((move: SortableMove) => boolean | string) | undefined;
  announcements?: Partial<SortableAnnouncements> | undefined;
  /** No lifting at all (a locked editor, a pending save). Handles stay focusable with aria-disabled. */
  disabled?: boolean | undefined;
  /** Pointer travel before a drag starts, in CSS px. Default 4. */
  threshold?: number | undefined;
  /** Default true. */
  autoScroll?: boolean | undefined;
};

export type SortableContainerOptions = {
  /** Spoken in announcements: "position 2 of 5 in NM". Single-container announcements leave it out. */
  label: string;
  /** "between" (default): insert between items, a line shows where. "onto": drop on an item or the container. */
  mode?: SortableMode | undefined;
  /** Default "vertical". */
  axis?: SortableAxis | undefined;
  /** Nothing can be dropped here. */
  disabled?: boolean | undefined;
};

export type SortableItemOptions = {
  container: string;
  index: number;
  label: string;
  /** false: a drop target only, never lifted (pools' empty slot rows). Default true. */
  draggable?: boolean | undefined;
};

/** What container() returns: spread it on the list element. */
export type SortableContainerProps = {
  ref: (element: HTMLElement | null) => void;
  tabIndex: -1;
  "data-sortable-container": string;
  "data-sortable-drop": "inside" | undefined;
  "data-sortable-refused": "" | undefined;
};

/** What item() returns: spread it on the item element. */
export type SortableItemProps = {
  ref: (element: HTMLElement | null) => void;
  "data-sortable-item": string;
  "data-sortable-state": "lifted" | undefined;
  "data-sortable-drop": "before" | "after" | "onto" | undefined;
  "data-sortable-line": "top" | "bottom" | "left" | "right" | undefined;
  "data-sortable-refused": "" | undefined;
};

/** What handle() returns: spread it on a `<button>` (SortableHandle does). */
export type SortableHandleBindings = {
  ref: (element: HTMLElement | null) => void;
  type: "button";
  "aria-label": string;
  "aria-describedby": string;
  "aria-pressed": boolean;
  "aria-disabled": true | undefined;
  "data-lifted": "" | undefined;
  "data-sortable-handle": string;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onKeyUp: (event: ReactKeyboardEvent<HTMLElement>) => void;
  onClick: (event: ReactMouseEvent<HTMLElement>) => void;
  onBlur: () => void;
};

/** The target under a drag: the move it would make, and why it is refused ("" with no reason; null when allowed). */
export type SortableTargetState = SortableMove & { refusal: string | null };

/** The drag in progress. */
export type SortableState = {
  active: string | null;
  via: "pointer" | "keyboard" | null;
  target: SortableTargetState | null;
  pending: boolean;
};

/** The pointer overlay: the label, and the refusal reason under it. */
export type SortableChip = { label: string; refusal: string | null };

/** Everything the hook renders from. Internal. */
export type SortableSnapshot = SortableState & { announcement: string; chip: SortableChip | null };

/** What SortableLayer renders. Apps don't need it. */
export type SortableLayerState = {
  announcement: string;
  instructions: string;
  instructionsId: string;
  chip: SortableChip | null;
  chipRef: (element: HTMLElement | null) => void;
};

/** What useSortable returns. */
export type Sortable = {
  container(id: string, options: SortableContainerOptions): SortableContainerProps;
  item(id: string, options: SortableItemOptions): SortableItemProps;
  handle(id: string): SortableHandleBindings;
  /** The button path: same onMove, same announcements, same focus rules. */
  moveBy(id: string, by: -1 | 1): void;
  moveTo(id: string, to: SortablePlace): void;
  canMoveBy(id: string, by: -1 | 1): boolean;
  state: SortableState;
  layer: SortableLayerState;
};
