/**
 * @file tests/setup/dom.ts
 * @desc Setup for every test file: jest-dom matchers, DOM cleanup between tests, and enough of
 *       <dialog>'s showModal/close for the palette (jsdom has neither).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Mon Oct 5, 2026
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no showModal/close on <dialog>. Enough of them for the palette's and the dialogs'
// tests; tests fire "cancel" themselves with new Event("cancel", { cancelable: true }).
const proto = globalThis.HTMLDialogElement?.prototype;
if (proto && typeof proto.showModal !== "function") {
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

afterEach(() => {
  cleanup();
});
