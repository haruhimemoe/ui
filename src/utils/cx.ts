/**
 * @file src/utils/cx.ts
 * @desc Tiny class-name joiner: drops falsy values, joins the rest with single spaces.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

/** A class name, or a falsy value to skip (handy for `cond && "class"`). */
export type ClassValue = string | false | null | undefined | 0;

/**
 * @function cx
 * @param classes {ClassValue[]} class strings; falsy values are skipped
 * @returns {string} the non-empty classes in order, space-separated. It does not resolve Tailwind
 *          conflicts: a caller's class that fights a built-in one needs the `!` modifier.
 */
export const cx = (...classes: ClassValue[]): string => classes.filter(Boolean).join(" ");
