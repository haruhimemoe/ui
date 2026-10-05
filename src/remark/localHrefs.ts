/**
 * @file src/remark/localHrefs.ts
 * @desc A rehype plugin to run after rehype-sanitize: an in-page `#x` link whose target only exists
 *       as `user-content-x` (the sanitizer prefixed the id but not the href) is rewritten to
 *       `#user-content-x`. Footnotes and heading anchors then work without dropping the prefix.
 *       Hrefs are percent-decoded before matching, since non-ASCII hrefs arrive encoded.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

/** The slice of a hast node this plugin reads and writes. */
export type HastLike = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastLike[];
};

const each = (node: HastLike, visit: (node: HastLike) => void): void => {
  visit(node);
  for (const child of node.children ?? []) each(child, visit);
};

/**
 * @function rehypeLocalHrefs
 * @param options {{ prefix?: string }} the sanitizer's clobber prefix, default "user-content-"
 * @returns {(tree: HastLike) => void} a rehype transformer that fixes same-page links
 */
export const rehypeLocalHrefs =
  (options: { prefix?: string } = {}) =>
  (tree: HastLike): void => {
    const prefix = options.prefix ?? "user-content-";
    const ids = new Set<string>();
    each(tree, (node) => {
      const id = node.properties?.id;
      if (typeof id === "string") ids.add(id);
    });
    each(tree, (node) => {
      if (node.type !== "element" || node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !href.startsWith("#") || href.length < 2) return;
      const raw = href.slice(1);
      let id = raw;
      try {
        id = decodeURIComponent(raw);
      } catch {
        return;
      }
      if (ids.has(id) || !ids.has(prefix + id)) return;
      node.properties = { ...node.properties, href: `#${prefix}${raw}` };
    });
  };
