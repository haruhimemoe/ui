/**
 * @file src/components/sortable/sortableMoves.ts
 * @desc The commit and button half of useSortable's state machine, on top of the registry: the
 *       snapshot the hook renders from, the announcements' info, canDrop refusals, commit
 *       (onMove once, a promise sets pending, false or a reason refuses), the Up and Down
 *       buttons and moveTo, and the focus request after each move.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { resolveAnnouncements, type SortableAnnouncementInfo } from "./announcements.js";
import { FocusKeeper, type FocusRequest, flip, moveButton } from "./sortableFocus.js";
import { isNoopMove, type MeasuredContainer } from "./sortableMath.js";
import { SortableRegistry, visible } from "./sortableRegistry.js";
import type {
  SortableMove,
  SortablePlace,
  SortableSnapshot,
  UseSortableOptions,
} from "./sortableTypes.js";

/** The item being dragged, where it came from, and the rects measured when it lifted. */
export type Lift = {
  id: string;
  from: SortablePlace;
  label: string;
  via: "pointer" | "keyboard";
  measured: MeasuredContainer[];
};

/** Nothing lifted, nothing said. */
export const IDLE: SortableSnapshot = {
  active: null,
  via: null,
  target: null,
  pending: false,
  announcement: "",
  chip: null,
};

/** The registry, the snapshot, commits and the button path. */
export class SortableMoves extends SortableRegistry {
  snapshot: SortableSnapshot = IDLE;
  protected options: UseSortableOptions = { onMove: () => false };
  protected text = resolveAnnouncements(undefined);
  protected motion = false;
  protected lift: Lift | null = null;
  protected readonly focus = new FocusKeeper(
    (request) => this.focusTarget(request),
    (container) => visible(this.containers.get(container)?.element),
  );
  private readonly publishSnapshot: (snapshot: SortableSnapshot) => void;

  constructor(publish: (snapshot: SortableSnapshot) => void) {
    super();
    this.publishSnapshot = publish;
  }

  /** The latest options and motion preference, every render. */
  configure(options: UseSortableOptions, motion: boolean): void {
    this.options = options;
    this.text = resolveAnnouncements(options.announcements);
    this.motion = motion;
  }

  protected publish(patch: Partial<SortableSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.publishSnapshot(this.snapshot);
  }

  /** canDrop's answer: null when allowed, "" refused with no reason, else the reason. */
  protected refusalOf(move: SortableMove): string | null {
    const verdict = this.options.canDrop?.(move) ?? true;
    if (verdict === true) return null;
    return verdict === false ? "" : verdict;
  }

  /** What an announcement needs; `joining` counts the item into another container's total. */
  protected info(
    place: SortablePlace,
    label: string,
    extra: Partial<Pick<SortableAnnouncementInfo, "target" | "reason">> = {},
    joining = false,
  ): SortableAnnouncementInfo {
    return {
      label,
      position: place.index + 1,
      total: this.itemsIn(place.container).length + (joining ? 1 : 0),
      container: this.hasSeveral()
        ? (this.containers.get(place.container)?.options.label ?? null)
        : null,
      ...extra,
    };
  }

  /** One move to the app: onMove once, then the announcement and the focus request. */
  protected commit(move: SortableMove, button: -1 | 1 | null): void {
    const label = this.labelOf(move.id);
    const focus: FocusRequest = { id: move.id, container: move.to.container, button, done: null };
    // Worked out before onMove: by the time a promise settles, the app may have re-rendered.
    const dropped = this.text.dropped(
      this.info(move.to, label, {}, move.to.container !== move.from.container),
    );
    if (isNoopMove(this.modeOf(move.to.container), move.from, move.to)) {
      this.focus.want(focus);
      this.publish({ announcement: dropped });
      return;
    }
    const settle = (result: unknown): void => {
      this.focus.want(focus);
      if (result === false || typeof result === "string") {
        const reason = typeof result === "string" && result ? { reason: result } : {};
        const info = this.info(move.from, label, reason);
        this.publish({ pending: false, announcement: this.text.refused(info) });
        return;
      }
      this.publish({ pending: false, announcement: dropped });
    };
    let result: ReturnType<UseSortableOptions["onMove"]>;
    try {
      result = this.options.onMove(move);
    } catch {
      settle(false);
      return;
    }
    if (result instanceof Promise) {
      this.publish({ pending: true });
      result.then(settle, () => settle(false));
      return;
    }
    settle(result);
  }

  canMoveBy(id: string, by: -1 | 1): boolean {
    const item = this.items.get(id);
    if (!item || !this.isLive(item)) return false;
    if (this.options.disabled === true || this.snapshot.pending) return false;
    if (this.containers.get(item.options.container)?.options.disabled === true) return false;
    const to = item.options.index + by;
    return to >= 0 && to < this.itemsIn(item.options.container).length;
  }

  moveBy(id: string, by: -1 | 1): void {
    const item = this.items.get(id);
    if (!item || this.lift !== null || !this.canMoveBy(id, by)) return;
    const { container, index } = item.options;
    const neighbour = this.itemsIn(container)[index + by];
    const onto = this.modeOf(container) === "onto" ? (neighbour?.[0] ?? null) : null;
    const to = { container, index: index + by };
    this.buttonMove({ id, from: { container, index }, to, onto, via: "button" }, by);
  }

  moveTo(id: string, to: SortablePlace): void {
    const item = this.items.get(id);
    if (!item || this.lift !== null || this.snapshot.pending) return;
    if (this.options.disabled === true) return;
    const inside = this.itemsIn(to.container);
    const onto = this.modeOf(to.container) === "onto";
    const room = onto ? inside.length : inside.filter(([other]) => other !== id).length;
    const index = Math.max(0, Math.min(to.index, room));
    const under = onto ? (inside[index]?.[0] ?? null) : null;
    const from = { container: item.options.container, index: item.options.index };
    const move: SortableMove = {
      id,
      from,
      to: { container: to.container, index },
      onto: under === id ? null : under,
      via: "button",
    };
    this.buttonMove(move, null);
  }

  private buttonMove(move: SortableMove, button: -1 | 1 | null): void {
    const refusal = this.refusalOf(move);
    if (refusal === null) {
      this.commit(move, button);
      return;
    }
    this.focus.want({ id: move.id, container: move.from.container, button, done: null });
    const info = this.info(move.from, this.labelOf(move.id), refusal ? { reason: refusal } : {});
    this.publish({ announcement: this.text.refused(info) });
  }

  /** The handle, or the move button (the other one when this one reached an end). */
  private focusTarget(request: FocusRequest): HTMLElement | null {
    const handle = visible(this.handles.get(request.id));
    if (request.button === null) return handle;
    const first = this.canMoveBy(request.id, request.button)
      ? request.button
      : flip(request.button);
    return moveButton(request.id, first) ?? moveButton(request.id, flip(first)) ?? handle;
  }
}
