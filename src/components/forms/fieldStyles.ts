/**
 * @file src/components/forms/fieldStyles.ts
 * @desc Shared field classes for TextInput, Select, Textarea and RangeBox (the packs look), and
 *       the label class the fieldsets share. Focus is the theme's 2px h1 outline, the same ring
 *       every control gets, plus an h1 border; an invalid field keeps its rose border until it
 *       takes focus, when the h1 border and ring take over so focus stays visible. On a coarse
 *       pointer a field is 44px tall with 16px text (iOS Safari zooms into smaller text); under
 *       more contrast its border is c4.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sun Oct 4, 2026
 */

import { cx } from "../../utils/cx.js";

const FIELD =
  "w-full rounded-md border border-b3 bg-b6 px-3 py-2 text-c1 text-sm placeholder:text-c4 focus-visible:border-h1 disabled:opacity-50 aria-invalid:border-rose-400 aria-invalid:focus-visible:border-h1 coarse:min-h-11 coarse:text-base contrast-more:border-c4";

/** A field or group label: bold c3 at text-sm (internal). */
export const FIELD_LABEL = "font-bold text-c3 text-sm";

/**
 * @function fieldClasses
 * @param className {string} extra classes, appended last. One that sets the same property as a
 *        built-in class replaces it: `fieldClasses("w-auto")` drops `w-full`.
 * @returns {string} class string for a form control
 */
export const fieldClasses = (className?: string | undefined): string => cx(FIELD, className);
