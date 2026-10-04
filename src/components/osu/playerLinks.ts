/**
 * @file src/components/osu/playerLinks.ts
 * @desc The osu! URLs and names PlayerCard builds from plain props: profile and avatar from a
 *       user id, osu-web's own country flag SVG from a two-letter code, the country's English
 *       name for the flag's alt text, and whether a cover is an animated GIF. Pure, server-safe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

const REGIONAL_INDICATOR_A = 0x1f1e6;

/**
 * @function profileUrl
 * @param id {number} the osu! user id
 * @returns {string} the user's osu! profile page
 */
export const profileUrl = (id: number): string => `https://osu.ppy.sh/users/${id}`;

/**
 * @function avatarUrl
 * @param id {number} the osu! user id
 * @returns {string} the user's current avatar on a.ppy.sh (osu! serves the default for none)
 */
export const avatarUrl = (id: number): string => `https://a.ppy.sh/${id}`;

/**
 * @function normalizeCountryCode
 * @param code {string | undefined} an ISO 3166-1 alpha-2 code, any case, maybe padded
 * @returns {string | null} the code in capitals, or null when it isn't two ASCII letters
 */
export function normalizeCountryCode(code: string | undefined): string | null {
  const upper = code?.trim().toUpperCase() ?? "";
  return /^[A-Z]{2}$/.test(upper) ? upper : null;
}

/**
 * @function flagUrl
 * @param code {string | undefined} an ISO 3166-1 alpha-2 code
 * @returns {string | null} osu-web's flag SVG (named by the flag emoji's regional-indicator code
 *          points, lowercase hex joined by "-"), or null for anything but two ASCII letters
 */
export function flagUrl(code: string | undefined): string | null {
  const upper = normalizeCountryCode(code);
  if (!upper) return null;
  const points = [...upper].map((letter) =>
    (REGIONAL_INDICATOR_A + letter.charCodeAt(0) - 65).toString(16),
  );
  return `https://osu.ppy.sh/assets/images/flags/${points.join("-")}.svg`;
}

/**
 * @function countryName
 * @param code {string} an ISO 3166-1 alpha-2 code
 * @returns {string} the region's English name from Intl, or the code in capitals when Intl
 *          doesn't know it
 */
export function countryName(code: string): string {
  const upper = code.trim().toUpperCase();
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(upper) ?? upper;
  } catch {
    return upper;
  }
}

/**
 * @function isAnimatedImage
 * @param url {string} an image URL
 * @returns {boolean} true when the path ends in .gif (before any query or hash)
 */
export const isAnimatedImage = (url: string): boolean => /\.gif(?:[?#]|$)/i.test(url);
