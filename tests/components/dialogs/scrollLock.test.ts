/**
 * @file tests/components/dialogs/scrollLock.test.ts
 * @desc lockScroll: saves the page's own inline overflow and puts it back, stays locked until the
 *       last of several locks is released, and ignores a second release.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { afterEach, describe, expect, it } from "vitest";
import { lockScroll } from "../../../src/components/dialogs/scrollLock.js";

const overflow = () => document.documentElement.style.overflow;

afterEach(() => {
  document.documentElement.style.overflow = "";
});

describe("lockScroll", () => {
  it("saves the page's own inline overflow and puts it back", () => {
    document.documentElement.style.overflow = "scroll";
    const release = lockScroll();
    expect(overflow()).toBe("hidden");
    release();
    expect(overflow()).toBe("scroll");
  });

  it("stays locked until the last of two locks is released", () => {
    const first = lockScroll();
    const second = lockScroll();
    first();
    expect(overflow()).toBe("hidden");
    second();
    expect(overflow()).toBe("");
  });

  it("ignores a second release of the same lock", () => {
    const first = lockScroll();
    const second = lockScroll();
    first();
    first();
    expect(overflow()).toBe("hidden");
    second();
    expect(overflow()).toBe("");
  });
});
