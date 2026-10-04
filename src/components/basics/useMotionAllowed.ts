/**
 * @file src/components/basics/useMotionAllowed.ts
 * @desc Whether the visitor allows motion, for motion JavaScript drives (an autoplay video, a
 *       canvas, element.animate()). CSS motion is already covered by theme.css's reduced-motion
 *       rule. False on the server, during hydration, without matchMedia, and while the visitor
 *       asks for reduced motion; it follows the setting live.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const reducedMotionQuery = (): MediaQueryList | null =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY)
    : null;

const subscribe = (onChange: () => void): (() => void) => {
  const list = reducedMotionQuery();
  if (!list) return () => {};
  if (typeof list.addEventListener === "function") {
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }
  // Safari before 14 has only the older addListener on a MediaQueryList.
  list.addListener(onChange);
  return () => list.removeListener(onChange);
};

const getSnapshot = (): boolean => {
  const list = reducedMotionQuery();
  return list ? !list.matches : false;
};

const getServerSnapshot = (): boolean => false;

/**
 * @function useMotionAllowed
 * @returns {boolean} true when the visitor allows motion; false on the server, during hydration,
 *          without matchMedia, and under prefers-reduced-motion: reduce
 */
export function useMotionAllowed(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
