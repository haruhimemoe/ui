/**
 * @file tests/helpers/axe.ts
 * @desc Accessibility assertion on axe-core, run locally against the jsdom tree (no network).
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import axe from "axe-core";
import { expect } from "vitest";

// WCAG 2.x A and AA. Color contrast is off: jsdom has no layout and the tests load no CSS, so
// axe can't compute colors here. The palette's contrast is checked by eye against the sites.
const OPTIONS: axe.RunOptions = {
  runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
  rules: { "color-contrast": { enabled: false } },
};

/**
 * @function expectNoAxeViolations
 * @param container {Element} the rendered subtree to check, usually `render(...).container`
 * @returns {Promise<void>} resolves when axe finds no violations; fails the test with a readable
 *          list (rule id, help text, offending selectors) otherwise
 */
export async function expectNoAxeViolations(container: Element): Promise<void> {
  const results = await axe.run(container, OPTIONS);
  const violations = results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
  );
  expect(violations, `axe violations:\n${violations.join("\n")}`).toEqual([]);
}
