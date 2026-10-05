/**
 * @file src/components/osu/MapCopyScope.tsx
 * @desc packs' PoolTable rule as a context: inside one scope only the Copy ID pressed last keeps
 *       its "Copied.". Each Copy ID asks the scope for a key; the one pressed last keeps the key
 *       it had when pressed, every other one gets the scope's fresh key, so it remounts and its
 *       status clears. A scope inside a scope joins the outer one. No classes, no cx.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

import { createContext, type ReactNode, useContext, useId, useMemo, useState } from "react";

type CopyState = { last: string | null; key: number; fresh: number };
type Scope = CopyState & { press: (token: string) => void };

const MapCopyContext = createContext<Scope | null>(null);

/**
 * @function MapCopyScope
 * @param props {{ children?: ReactNode }} the lists whose Copy ID buttons share one status
 * @returns {JSX.Element} the children inside the scope (or the outer scope, when nested)
 */
export function MapCopyScope({ children }: { children?: ReactNode }) {
  const outer = useContext(MapCopyContext);
  const [state, setState] = useState<CopyState>({ last: null, key: 0, fresh: 0 });
  const value = useMemo<Scope>(
    () => ({
      ...state,
      press: (token) =>
        setState((s) => (s.last === token ? s : { last: token, key: s.fresh, fresh: s.fresh + 1 })),
    }),
    [state],
  );
  if (outer) return <>{children}</>;
  return <MapCopyContext value={value}>{children}</MapCopyContext>;
}

/**
 * @function useMapCopyKey
 * @returns {{ key: number | "own"; press: () => void }} the key a Copy ID mounts its status
 *          under, and what to call on each press ("own" and a no-op outside any scope)
 */
export function useMapCopyKey(): { key: number | "own"; press: () => void } {
  const scope = useContext(MapCopyContext);
  const token = useId();
  if (!scope) return { key: "own", press: () => {} };
  return {
    key: scope.last === token ? scope.key : scope.fresh,
    press: () => scope.press(token),
  };
}
