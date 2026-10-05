/**
 * @file src/components/sortable/useSortable.ts
 * @desc useSortable: one SortableEngine per component, rendered from its snapshot. Call
 *       container(), item() and handle() during render and spread what they return; render one
 *       SortableLayer per hook. The app owns the data: onMove gets each move and applies it,
 *       changes it or refuses it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useMotionAllowed } from "../basics/useMotionAllowed.js";
import { IDLE, SortableEngine } from "./sortableEngine.js";
import type { Sortable, SortableSnapshot, UseSortableOptions } from "./sortableTypes.js";

/**
 * @function useSortable
 * @param options {UseSortableOptions} onMove, and optionally canDrop, announcements, disabled,
 *        threshold and autoScroll
 * @returns {Sortable} props getters for containers, items and handles, the button moves, the
 *          drag's state and what SortableLayer renders
 */
export function useSortable(options: UseSortableOptions): Sortable {
  const [snapshot, setSnapshot] = useState<SortableSnapshot>(IDLE);
  const engineRef = useRef<SortableEngine | null>(null);
  if (engineRef.current === null) engineRef.current = new SortableEngine(setSnapshot);
  const engine = engineRef.current;
  const instructionsId = useId();
  const motion = useMotionAllowed();
  engine.configure(options, motion);
  engine.beginRender();
  useLayoutEffect(() => {
    engine.afterRender();
  });
  useEffect(() => () => engine.dispose(), [engine]);
  return engine.api(snapshot, instructionsId);
}
