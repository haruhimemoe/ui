/**
 * @file tests/components/palette/useProviderSearch.test.tsx
 * @desc useProviderSearch: waits for minLength, debounces, aborts a superseded search and drops
 *       its result, dispatches loading, done and error, and stops when disabled.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PaletteAction } from "../../../src/components/palette/store.js";
import type { Command, Provider } from "../../../src/components/palette/types.js";
import { useProviderSearch } from "../../../src/components/palette/useProviderSearch.js";

// One object per id: the expectations compare `run` by identity.
const rows = new Map<string, Command>();
const row = (id: string): Command => {
  const found = rows.get(id);
  if (found) return found;
  const made: Command = { id, title: id, run: () => {} };
  rows.set(id, made);
  return made;
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const setup = (search: Provider["search"], query = "", enabled = true) => {
  const dispatch = vi.fn<(action: PaletteAction) => void>();
  const provider: Provider = { id: "p", debounceMs: 100, search };
  const hook = renderHook(
    ({ q, on }: { q: string; on: boolean }) =>
      useProviderSearch({ providers: [provider], query: q, depth: 1, dispatch, enabled: on }),
    { initialProps: { q: query, on: enabled } },
  );
  return { dispatch, hook };
};

describe("useProviderSearch", () => {
  it("does nothing below minLength and dispatches loading then done after the debounce", async () => {
    const search = vi.fn<Provider["search"]>(async () => [row("a")]);
    const { dispatch, hook } = setup(search, "a");
    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(search).not.toHaveBeenCalled();
    hook.rerender({ q: "ab", on: true });
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "provided",
      depth: 1,
      providerId: "p",
      result: { state: "loading", rows: [] },
    });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(search).toHaveBeenCalledWith("ab", expect.any(AbortSignal));
    expect(dispatch).toHaveBeenLastCalledWith({
      type: "provided",
      depth: 1,
      providerId: "p",
      result: { state: "done", rows: [row("a")] },
    });
  });

  it("aborts the earlier search and ignores its late result", async () => {
    const signals: AbortSignal[] = [];
    let resolveFirst: (rows: Command[]) => void = () => {};
    const search = vi.fn((query: string, signal: AbortSignal) => {
      signals.push(signal);
      return query === "ab"
        ? new Promise<Command[]>((resolve) => {
            resolveFirst = resolve;
          })
        : Promise.resolve([row("c")]);
    });
    const { dispatch, hook } = setup(search, "ab");
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    hook.rerender({ q: "abc", on: true });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(signals[0]?.aborted).toBe(true);
    expect(dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({ result: { state: "done", rows: [row("c")] } }),
    );
    await act(async () => {
      resolveFirst([row("stale")]);
    });
    expect(dispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ result: expect.objectContaining({ rows: [row("stale")] }) }),
    );
  });

  it("dispatches error on a rejection (not on abort) and logs it", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { dispatch } = setup(async () => {
      throw new Error("down");
    }, "ab");
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(dispatch).toHaveBeenLastCalledWith(
      expect.objectContaining({ result: { state: "error", rows: [] } }),
    );
    expect(error).toHaveBeenCalledOnce();
  });

  it("searches nothing while disabled, and aborts on unmount", async () => {
    const search = vi.fn<Provider["search"]>(async () => []);
    const { hook } = setup(search, "ab", false);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(search).not.toHaveBeenCalled();
    hook.rerender({ q: "ab", on: true });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(search).toHaveBeenCalledOnce();
    const signal = search.mock.calls[0]?.[1] as AbortSignal;
    hook.unmount();
    expect(signal.aborted).toBe(true);
  });
});
