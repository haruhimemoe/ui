/**
 * @file tests/components/mdx/highlighter.test.ts
 * @desc Unit tests for getHighlighter: it loads Shiki once and reuses the cached instance, and
 *       returns null (warning exactly once) when loading fails, without Shiki itself importing
 *       anywhere except through the loader it's given.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { getHighlighter, resetHighlighter } from "../../../src/components/mdx/highlighter.js";

describe("getHighlighter", () => {
  afterEach(() => {
    resetHighlighter();
    vi.restoreAllMocks();
  });

  it("loads Shiki once and reuses it", async () => {
    const first = await getHighlighter();
    expect(first?.getLoadedLanguages()).toEqual(
      expect.arrayContaining(["typescript", "ts", "bash", "yaml", "diff"]),
    );
    expect(await getHighlighter()).toBe(first);
  }, 20000);

  it("returns null and warns once when Shiki can't load", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failing = () => Promise.reject(new Error("Cannot find package 'shiki'"));
    expect(await getHighlighter(failing)).toBeNull();
    expect(await getHighlighter(failing)).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
