/**
 * @file src/components/dialogs/scrollLock.ts
 * @desc The page scroll lock the dialogs share. Counted: the first lock saves the page's own
 *       inline overflow and sets it to hidden, the last release puts the saved value back, so a
 *       confirm opened over the palette and a page that set its own overflow both come out right.
 *       Internal.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

"use client";

let locks = 0;
let saved = "";

/**
 * @function lockScroll
 * @returns {() => void} the release; calling it a second time does nothing
 */
export function lockScroll(): () => void {
  const root = document.documentElement;
  if (locks === 0) {
    saved = root.style.overflow;
    root.style.overflow = "hidden";
  }
  locks += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) root.style.overflow = saved;
  };
}
