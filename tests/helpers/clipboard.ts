/**
 * @file tests/helpers/clipboard.ts
 * @desc Swaps navigator.clipboard for a stub whose writeText does what the test says, and
 *       puts the real one back.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { vi } from "vitest";

/**
 * @function stubClipboard
 * @param writeText {(text: string) => Promise<void>} what a copy does (default: succeeds)
 * @returns {{ writeText: Mock; restore: () => void }} the spy and a restore function
 */
export function stubClipboard(
  writeText: (text: string) => Promise<void> = () => Promise.resolve(),
) {
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  const spy = vi.fn(writeText);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: spy } });
  return {
    writeText: spy,
    restore: () => {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    },
  };
}
