/**
 * @file src/remark/slugify.ts
 * @desc GitHub-style heading slugs: lowercase, drop punctuation (keeping letters, marks, digits
 *       and underscores from any script), turn each run of whitespace into one hyphen, and
 *       suffix repeats `-1`, `-2` the way GitHub's own heading anchors do.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

/**
 * @function slugify
 * @param text {string} the heading text
 * @returns {string} a lowercase, hyphenated slug (letters/marks/digits/underscores from any
 *          script survive; everything else but whitespace and existing hyphens is dropped)
 */
export const slugify = (text: string): string =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\s-]/gu, "")
    .replace(/\s/g, "-");

/**
 * @function createSlugger
 * @returns {(text: string) => string} a function that slugs `text` and, on a repeat base slug,
 *          appends `-1`, `-2`, … like GitHub's heading anchors
 */
export const createSlugger = (): ((text: string) => string) => {
  const seen = new Map<string, number>();
  return (text) => {
    const base = slugify(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
};
