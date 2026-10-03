/**
 * @file src/components/palette/platform.ts
 * @desc Whether this is a Mac, so `mod` means Command and hints say ⌘. Client-only (reads
 *       navigator); the palette and its button call it after mount.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

"use client";

/**
 * @function isMac
 * @returns {boolean} true on macOS, from `userAgentData.platform` or `navigator.platform`
 */
export function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const data = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  if (data?.platform) return data.platform === "macOS";
  return /^Mac/.test(navigator.platform ?? "");
}
