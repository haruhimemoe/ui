/**
 * @file tests/components/mdx/highlighter.test.ts
 * @desc Unit tests for the highlighter registry: importing src/shiki.ts registers a working
 *       loader that loads Shiki once; with nothing registered getHighlighter resolves null and
 *       warns once, naming the import to add; a loader that rejects also gives null, warned
 *       once; production stays quiet.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getHighlighter,
  resetHighlighter,
  setHighlighterLoader,
} from "../../../src/components/mdx/highlighter.js";

describe("getHighlighter", () => {
  afterEach(() => {
    resetHighlighter();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  // First: importing src/shiki.ts registers only on the module's first evaluation.
  it("uses the loader src/shiki.ts registers, loading Shiki once", async () => {
    await import("../../../src/shiki.js");
    const first = await getHighlighter();
    expect(first?.getLoadedLanguages()).toEqual(
      expect.arrayContaining(["typescript", "ts", "bash", "yaml", "diff"]),
    );
    expect(await getHighlighter()).toBe(first);
  }, 20000);

  it("resolves null with nothing registered and warns once with the import to add", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await getHighlighter()).toBeNull();
    expect(await getHighlighter()).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('import "@haruhimemoe/ui/shiki"');
  });

  it("returns null and warns once when the registered loader rejects", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    setHighlighterLoader(() => Promise.reject(new Error("Cannot find package 'shiki'")));
    expect(await getHighlighter()).toBeNull();
    expect(await getHighlighter()).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain("Shiki didn't load");
  });

  it("drops the cached highlighter when a new loader registers", async () => {
    const one = {} as never;
    const two = {} as never;
    setHighlighterLoader(() => Promise.resolve(one));
    expect(await getHighlighter()).toBe(one);
    setHighlighterLoader(() => Promise.resolve(two));
    expect(await getHighlighter()).toBe(two);
  });

  it("stays quiet in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await getHighlighter()).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });
});
