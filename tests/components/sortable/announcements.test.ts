/**
 * @file tests/components/sortable/announcements.test.ts
 * @desc The default sortable announcements: 1-based positions, the container named only when
 *       there are several, onto and end-of wording, reasons with or without a trailing period,
 *       and overrides merged per key.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import {
  resolveAnnouncements,
  type SortableAnnouncements,
  DEFAULT_SORTABLE_ANNOUNCEMENTS as text,
} from "../../../src/components/sortable/announcements.js";

const multi = { label: "NM2", position: 2, total: 5, container: "NM" };
const single = { label: "Alpha", position: 2, total: 5, container: null };

describe("default announcements", () => {
  it("has the instructions and the handle name", () => {
    expect(text.instructions).toBe(
      "Press Space or Enter to pick up. Use the arrow keys to move, Space or Enter to drop, Escape to cancel.",
    );
    expect(text.handle("NM2")).toBe("Reorder NM2");
  });

  it("names the container only when there are several", () => {
    expect(text.lifted(multi)).toBe("Picked up NM2. Position 2 of 5 in NM.");
    expect(text.lifted(single)).toBe("Picked up Alpha. Position 2 of 5.");
    expect(text.dropped({ ...multi, position: 4, container: "HD" })).toBe(
      "Dropped NM2. Position 4 of 5 in HD.",
    );
    expect(text.cancelled(single)).toBe("Cancelled. Alpha is back at position 2 of 5.");
  });

  it("says where an over step is: a position, onto an item, or the end", () => {
    expect(text.over({ ...multi, position: 4, container: "HD" })).toBe(
      "NM2: position 4 of 5 in HD.",
    );
    expect(text.over({ ...multi, target: "NM1" })).toBe("NM2: onto NM1.");
    expect(text.over({ ...multi, target: null })).toBe("NM2: end of NM.");
    expect(text.over({ ...single, target: null })).toBe("Alpha: end of the list.");
    expect(text.over({ ...multi, target: null, reason: "A candidate stays in its bucket." })).toBe(
      "NM2: end of NM. Can't go there: A candidate stays in its bucket.",
    );
  });

  it("gives the reason for a refusal when there is one", () => {
    expect(text.refused({ ...single, reason: "HD is full." })).toBe(
      "Alpha can't go there: HD is full. Back at position 2 of 5.",
    );
    expect(text.refused(single)).toBe("Alpha can't go there. Back at position 2 of 5.");
  });
});

describe("resolveAnnouncements", () => {
  it("merges overrides per key and ignores undefined ones", () => {
    // A JavaScript caller can set a key to undefined; the default must survive it.
    // (exactOptionalPropertyTypes rejects the literal, hence the cast.)
    const overrides = { handle: (label: string) => `Drag ${label}`, lifted: undefined };
    const merged = resolveAnnouncements(overrides as unknown as Partial<SortableAnnouncements>);
    expect(merged.handle("x")).toBe("Drag x");
    expect(merged.lifted).toBe(text.lifted);
    expect(resolveAnnouncements(undefined)).toEqual(text);
  });
});
