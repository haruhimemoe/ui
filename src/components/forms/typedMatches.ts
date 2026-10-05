/**
 * @file src/components/forms/typedMatches.ts
 * @desc typedMatches, the type-to-confirm rule TypeToConfirm and ConfirmDialog share. Internal.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

/**
 * @function typedMatches
 * @param typed {string} what the person typed
 * @param expected {string} what they were asked to type
 * @returns {boolean} true when they match exactly, case-sensitive, spaces around either side
 *          ignored
 */
export const typedMatches = (typed: string, expected: string): boolean =>
  typed.trim() === expected.trim();
