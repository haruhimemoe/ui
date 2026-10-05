/**
 * @file src/components/basics/kbdStyles.ts
 * @desc The keyboard-key look, shared by Kbd and the command palette's shortcut hints. Plain
 *       strings with no cx, so the palette's client files can import them.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** Internal: the key look without padding or size (PaletteFooter adds its own); a c4 border under more contrast. */
export const KBD_BASE = "rounded border border-b3 bg-b5 font-sans text-c3 contrast-more:border-c4";

/** The classes Kbd renders: a small bordered key. Public, for a kbd you build yourself. */
export const kbdClasses = `${KBD_BASE} px-1.5 text-xs`;
