/**
 * @file src/components/palette/useProviderSearch.ts
 * @desc Runs a frame's providers as the query changes: each one waits for its minLength,
 *       debounces, and gets an AbortSignal that fires when a newer query starts, the frame goes
 *       away, or the palette closes. A superseded search's result is dropped even if it
 *       resolves. Results go to the store by frame depth and provider id.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

import { useEffect } from "react";
import type { PaletteAction } from "./store.js";
import type { Provider } from "./types.js";

const DEFAULT_DEBOUNCE = 200;
const DEFAULT_MIN = 2;

/** What the hook needs. */
export type ProviderSearchArgs = {
  providers: readonly Provider[];
  query: string;
  /** The frame's index in the stack, so results land on it even after a push. */
  depth: number;
  dispatch: (action: PaletteAction) => void;
  /** False while the palette is closed, or the frame isn't on top. */
  enabled: boolean;
};

/**
 * @function useProviderSearch
 * @param args {ProviderSearchArgs} providers, the query, the frame depth, dispatch and enabled
 * @returns {void}
 */
export function useProviderSearch({
  providers,
  query,
  depth,
  dispatch,
  enabled,
}: ProviderSearchArgs): void {
  useEffect(() => {
    if (!enabled) return;
    const trimmed = query.trim();
    const controllers: AbortController[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (const provider of providers) {
      if (trimmed.length < (provider.minLength ?? DEFAULT_MIN)) continue;
      const controller = new AbortController();
      controllers.push(controller);
      dispatch({
        type: "provided",
        depth,
        providerId: provider.id,
        result: { state: "loading", rows: [] },
      });
      timers.push(
        setTimeout(() => {
          provider.search(trimmed, controller.signal).then(
            (rows) => {
              if (controller.signal.aborted) return;
              dispatch({
                type: "provided",
                depth,
                providerId: provider.id,
                result: { state: "done", rows },
              });
            },
            (error: unknown) => {
              if (controller.signal.aborted) return;
              console.error(`CommandPalette: provider "${provider.id}" failed`, error);
              dispatch({
                type: "provided",
                depth,
                providerId: provider.id,
                result: { state: "error", rows: [] },
              });
            },
          );
        }, provider.debounceMs ?? DEFAULT_DEBOUNCE),
      );
    }
    return () => {
      for (const timer of timers) clearTimeout(timer);
      for (const controller of controllers) controller.abort();
    };
  }, [providers, query, depth, dispatch, enabled]);
}
