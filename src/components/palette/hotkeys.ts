/**
 * @file src/components/palette/hotkeys.ts
 * @desc Shortcut text ("mod+k", "?", a chord "g p") parsed, matched against keydown events and
 *       shown as kbd parts. `mod` is Command on a Mac (platform.ts decides) and Control
 *       elsewhere. A chord is two bare keys in a row; CommandPalette times it. Editable targets
 *       (fields, contenteditable, a dialog that isn't the palette) never fire command shortcuts.
 *       Pure: no directive, so server-safe files (PaletteRow) can import it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

/** A key with modifiers. `key` is lower-case, compared to `event.key`. */
export type Combo = {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
};

/** A combo, or a chord of two bare keys pressed in turn. */
export type Shortcut =
  | { kind: "combo"; combo: Combo }
  | { kind: "chord"; keys: readonly [string, string] };

const MODIFIERS = new Set(["mod", "shift", "alt", "ctrl", "meta"]);

/**
 * @function parseShortcut
 * @param text {string} "mod+shift+c", "?" or "g p"
 * @returns {Shortcut | null} the parsed shortcut, or null for text that isn't one
 */
export function parseShortcut(text: string): Shortcut | null {
  const trimmed = text.trim().toLowerCase();
  if (trimmed.length === 0) return null;
  const chord = trimmed.split(/\s+/);
  if (chord.length === 2 && chord.every((k) => k.length === 1)) {
    return { kind: "chord", keys: [chord[0] as string, chord[1] as string] };
  }
  if (chord.length !== 1) return null;
  const parts = trimmed.split("+");
  const key = parts.pop();
  if (!key || parts.some((part) => !MODIFIERS.has(part))) return null;
  const has = (name: string) => parts.includes(name);
  return {
    kind: "combo",
    combo: {
      key,
      mod: has("mod"),
      shift: has("shift"),
      alt: has("alt"),
      ctrl: has("ctrl"),
      meta: has("meta"),
    },
  };
}

const isLetterOrDigit = (key: string): boolean => /^[a-z0-9]$/i.test(key);

/**
 * @function matchesCombo
 * @param event {KeyboardEvent} a keydown
 * @param combo {Combo} the parsed combo
 * @param mac {boolean} whether `mod` means Meta
 * @returns {boolean} true when the key and the exact modifier set match. Shift is not required
 *          for a symbol key such as "?", which needs it on most layouts.
 */
export function matchesCombo(event: KeyboardEvent, combo: Combo, mac: boolean): boolean {
  if (event.key.toLowerCase() !== combo.key) return false;
  const wantMeta = combo.meta || (combo.mod && mac);
  const wantCtrl = combo.ctrl || (combo.mod && !mac);
  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl || event.altKey !== combo.alt)
    return false;
  if (combo.key.length === 1 && !isLetterOrDigit(combo.key) && !combo.shift) return true;
  return event.shiftKey === combo.shift;
}

/**
 * @function isEditableTarget
 * @param target {EventTarget | null} the keydown's target
 * @returns {boolean} true inside an input, textarea, select, contenteditable, or a `<dialog>`
 *          without `data-palette`
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  const dialog = target.closest("dialog");
  return dialog !== null && !dialog.hasAttribute("data-palette");
}

const KEY_NAMES: Record<string, string> = {
  arrowup: "↑",
  arrowdown: "↓",
  enter: "↵",
  escape: "Esc",
  backspace: "⌫",
};

/**
 * @function displayShortcut
 * @param shortcut {Shortcut} a parsed shortcut
 * @param mac {boolean} symbols (⌘ ⇧ ⌥ ⌃) on a Mac, words elsewhere
 * @returns {string[]} one entry per `<kbd>`, in order
 */
export function displayShortcut(shortcut: Shortcut, mac: boolean): string[] {
  const name = (key: string) => KEY_NAMES[key] ?? key.toUpperCase();
  if (shortcut.kind === "chord") return shortcut.keys.map(name);
  const { combo } = shortcut;
  const parts: string[] = [];
  if (combo.ctrl || (combo.mod && !mac)) parts.push(mac ? "⌃" : "Ctrl");
  if (combo.alt) parts.push(mac ? "⌥" : "Alt");
  if (combo.shift) parts.push(mac ? "⇧" : "Shift");
  if (combo.meta || (combo.mod && mac)) parts.push(mac ? "⌘" : "Win");
  parts.push(name(combo.key));
  return parts;
}
