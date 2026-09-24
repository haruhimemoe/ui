/**
 * @file src/utils/cx.ts
 * @desc Class-name merger: drops falsy values and resolves Tailwind conflicts with tailwind-merge,
 *       so a later class (the caller's) replaces an earlier one that sets the same property. Same
 *       behavior as the sites' `cn` helper.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { twMerge } from "tailwind-merge";

/** A class name, or a falsy value to skip (handy for `cond && "class"`). */
export type ClassValue = string | false | null | undefined | 0;

/**
 * @function cx
 * @param classes {ClassValue[]} class strings; falsy values are skipped
 * @returns {string} the classes in order, space-separated, with Tailwind conflicts resolved in
 *          favor of the later class (`cx("w-full", "w-auto")` is `"w-auto"`)
 */
export const cx = (...classes: ClassValue[]): string => twMerge(...classes);
