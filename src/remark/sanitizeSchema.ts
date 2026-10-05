/**
 * @file src/remark/sanitizeSchema.ts
 * @desc rehype-sanitize's schema plus what this kit's remark plugins write and mdxComponents
 *       read: figure/figcaption, picture/source, h2-h4 ids, code language and fence meta, callout
 *       markers and embed divs. A plain function over a schema object, so this file never imports
 *       rehype-sanitize. Base arrays are copied, never mutated. Untrusted by default: ids keep the
 *       `user-content-` prefix so raw HTML can't clobber globals; `trusted: true` is for content
 *       from our own repos only.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** The slice of a hast-util-sanitize schema this helper reads and writes. */
export type SanitizeSchema = {
  tagNames?: readonly string[] | null | undefined;
  attributes?: Record<string, readonly unknown[]> | null | undefined;
  clobberPrefix?: string | null | undefined;
  [key: string]: unknown;
};

const EXTRA_TAGS = ["figure", "figcaption", "picture", "source"];
const EXTRA_ATTRIBUTES: Record<string, unknown[]> = {
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  code: [["className", /^language-/], "dataMeta"],
  blockquote: ["dataCallout"],
  div: ["dataEmbed"],
  source: ["srcSet", "media", "type"],
};

/**
 * @function haruhimeSanitizeSchema
 * @param base {S} usually rehype-sanitize's `defaultSchema`
 * @param options {{ trusted?: boolean }} `trusted: true` drops the id prefix (our own READMEs)
 * @returns {S} a copy of `base` with the kit's tags and attributes added
 */
export function haruhimeSanitizeSchema<S extends SanitizeSchema>(
  base: S,
  options: { trusted?: boolean } = {},
): S {
  const attributes: Record<string, unknown[]> = {};
  for (const [tag, list] of Object.entries(base.attributes ?? {})) attributes[tag] = [...list];
  for (const [tag, list] of Object.entries(EXTRA_ATTRIBUTES)) {
    attributes[tag] = [...(attributes[tag] ?? []), ...list];
  }
  const tagNames = [...(base.tagNames ?? [])];
  for (const tag of EXTRA_TAGS) if (!tagNames.includes(tag)) tagNames.push(tag);
  return { ...base, tagNames, attributes, ...(options.trusted ? { clobberPrefix: "" } : {}) } as S;
}
