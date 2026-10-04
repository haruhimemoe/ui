/**
 * @file src/remark/slugify.ts
 * @desc GitHub-style heading slugs: lowercase, drop punctuation (keeping letters, marks, digits
 *       and underscores from any script), turn each whitespace character into a hyphen, and
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
 * @returns {(text: string) => string} a function that slugs `text` and, on a repeat (the slug
 *          itself, or a literal heading that already claimed the suffixed form), appends `-1`,
 *          `-2`, … until it finds an unused candidate, like GitHub's heading anchors
 */
export const createSlugger = (): ((text: string) => string) => {
  const occurrences = new Map<string, number>();
  return (text) => {
    const base = slugify(text);
    let candidate = base;
    while (occurrences.has(candidate)) {
      const count = (occurrences.get(base) ?? 0) + 1;
      occurrences.set(base, count);
      candidate = `${base}-${count}`;
    }
    occurrences.set(candidate, 0);
    return candidate;
  };
};
