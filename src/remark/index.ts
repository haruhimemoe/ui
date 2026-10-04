/**
 * @file src/remark/index.ts
 * @desc The public entry point for `@haruhimemoe/ui/remark`: one remark plugin for MDX and
 *       react-markdown that combines code meta, callouts and heading ids, plus the individual
 *       plugins and the slug helpers for callers who want only one piece.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { remarkCallouts } from "./callouts.js";
import { remarkCodeMeta } from "./codeMeta.js";
import { remarkHeadingIds } from "./headingIds.js";
import type { MdNode } from "./mdast.js";

export type { CalloutType } from "./callouts.js";
export { remarkCallouts } from "./callouts.js";
export { remarkCodeMeta } from "./codeMeta.js";
export { remarkHeadingIds } from "./headingIds.js";
export { createSlugger, slugify } from "./slugify.js";

/** Which of the three plugins `remarkHaruhime` runs; each defaults to on. */
export type RemarkHaruhimeOptions = {
  codeMeta?: boolean;
  callouts?: boolean;
  headingIds?: boolean;
};

/**
 * @function remarkHaruhime
 * @param options {RemarkHaruhimeOptions} per-plugin opt-outs; omit to run all three
 * @returns {(tree: MdNode) => void} a remark transformer running code meta, callouts and heading
 *          ids over one tree. A default export, because Turbopack only takes MDX plugins by
 *          module name: `remarkPlugins: ["@haruhimemoe/ui/remark"]`.
 */
export default function remarkHaruhime(options: RemarkHaruhimeOptions = {}) {
  return (tree: MdNode): void => {
    if (options.codeMeta !== false) remarkCodeMeta()(tree);
    if (options.callouts !== false) remarkCallouts()(tree);
    if (options.headingIds !== false) remarkHeadingIds()(tree);
  };
}
