/**
 * @file tests/components/palette/hotkeys.test.ts
 * @desc parseShortcut for combos and chords, matchesCombo with mod on mac and elsewhere,
 *       isEditableTarget, displayShortcut, isMac from navigator.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  displayShortcut,
  isEditableTarget,
  matchesCombo,
  parseShortcut,
} from "../../../src/components/palette/hotkeys.js";
import { isMac } from "../../../src/components/palette/platform.js";

const key = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);

afterEach(() => vi.unstubAllGlobals());

describe("parseShortcut", () => {
  it("parses combos, chords and single keys; rejects junk", () => {
    expect(parseShortcut("mod+shift+c")).toEqual({
      kind: "combo",
      combo: { key: "c", mod: true, shift: true, alt: false, ctrl: false, meta: false },
    });
    expect(parseShortcut("g p")).toEqual({ kind: "chord", keys: ["g", "p"] });
    expect(parseShortcut("?")).toEqual({
      kind: "combo",
      combo: { key: "?", mod: false, shift: false, alt: false, ctrl: false, meta: false },
    });
    expect(parseShortcut("mod+")).toBeNull();
    expect(parseShortcut("a b c")).toBeNull();
    expect(parseShortcut("")).toBeNull();
  });
});

describe("matchesCombo", () => {
  const modK = parseShortcut("mod+k");
  const combo = modK?.kind === "combo" ? modK.combo : null;
  it("mod is Meta on mac and Control elsewhere, and the other must be up", () => {
    expect(combo).not.toBeNull();
    if (!combo) return;
    expect(matchesCombo(key({ key: "k", metaKey: true }), combo, true)).toBe(true);
    expect(matchesCombo(key({ key: "k", ctrlKey: true }), combo, true)).toBe(false);
    expect(matchesCombo(key({ key: "k", ctrlKey: true }), combo, false)).toBe(true);
    expect(matchesCombo(key({ key: "k", ctrlKey: true, metaKey: true }), combo, false)).toBe(false);
    expect(matchesCombo(key({ key: "K", ctrlKey: true, shiftKey: true }), combo, false)).toBe(
      false,
    );
  });
  it("ignores shift for a printable symbol like ?", () => {
    const q = parseShortcut("?");
    if (q?.kind !== "combo") throw new Error("combo");
    expect(matchesCombo(key({ key: "?", shiftKey: true }), q.combo, false)).toBe(true);
    expect(matchesCombo(key({ key: "/", shiftKey: true }), q.combo, false)).toBe(false);
  });
});

describe("isEditableTarget", () => {
  it("is true in inputs, textareas, selects, contenteditable and foreign dialogs", () => {
    document.body.innerHTML = `
      <input id="i"><textarea id="t"></textarea><select id="s"></select>
      <div id="c" contenteditable="true"></div><dialog id="d"><button id="db"></button></dialog>
      <dialog id="p" data-palette><button id="pb"></button></dialog><button id="b"></button>`;
    for (const id of ["i", "t", "s", "db"])
      expect(isEditableTarget(document.getElementById(id))).toBe(true);
    const c = document.getElementById("c") as HTMLElement;
    Object.defineProperty(c, "isContentEditable", { value: true });
    expect(isEditableTarget(c)).toBe(true);
    expect(isEditableTarget(document.getElementById("b"))).toBe(false);
    expect(isEditableTarget(document.getElementById("pb"))).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});

describe("displayShortcut", () => {
  it("uses symbols on mac and words elsewhere, and 'then' for chords", () => {
    const combo = parseShortcut("mod+shift+c");
    const chord = parseShortcut("g p");
    if (!combo || !chord) throw new Error("parse");
    expect(displayShortcut(combo, true)).toEqual(["⇧", "⌘", "C"]);
    expect(displayShortcut(combo, false)).toEqual(["Ctrl", "Shift", "C"]);
    expect(displayShortcut(chord, true)).toEqual(["G", "P"]);
  });
});

describe("isMac", () => {
  it("reads userAgentData first, then platform", () => {
    vi.stubGlobal("navigator", { userAgentData: { platform: "macOS" }, platform: "Win32" });
    expect(isMac()).toBe(true);
    vi.stubGlobal("navigator", { platform: "MacIntel" });
    expect(isMac()).toBe(true);
    vi.stubGlobal("navigator", { platform: "Linux x86_64" });
    expect(isMac()).toBe(false);
  });
});
