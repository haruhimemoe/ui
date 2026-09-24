/**
 * @file src/components/forms/fieldStyles.ts
 * @desc Shared classes for inputs, selects, and textareas (osu!-web dark fields). Focus shows as
 *       an h1 border. On an invalid field it also gets an h1 ring, since rose to pink alone is
 *       hard to see. `outline-hidden` (not `outline-none`) leaves a transparent outline that
 *       forced-colors mode paints, so focus shows there too.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { cx } from "../../utils/cx.js";

const FIELD =
  "w-full rounded-md border border-b3 bg-b6 px-3 py-2 text-c1 text-sm placeholder:text-c4 focus-visible:border-h1 focus-visible:outline-hidden disabled:opacity-50 aria-invalid:border-rose-400 aria-invalid:focus-visible:border-h1 aria-invalid:focus-visible:ring-1 aria-invalid:focus-visible:ring-h1";

/**
 * @function fieldClasses
 * @param className {string} extra classes, appended last. One that sets the same property as a
 *        built-in class replaces it: `fieldClasses("w-auto")` drops `w-full`.
 * @returns {string} class string for a form control
 */
export const fieldClasses = (className?: string | undefined): string => cx(FIELD, className);
