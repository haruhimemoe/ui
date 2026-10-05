/**
 * @file tests/components/mdx/Steps.test.tsx
 * @desc Steps: keeps the wrapped ordered list's native semantics while adding the numbered-rail
 *       classes.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Steps } from "../../../src/components/mdx/Steps.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Steps", () => {
  it("keeps the ordered list and its semantics", async () => {
    const { container } = render(
      <Steps>
        <ol>
          <li>
            <strong>Open staff applications</strong> two weeks out.
          </li>
          <li>
            <strong>Pick the mappool team</strong>.
          </li>
        </ol>
      </Steps>,
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.firstElementChild).toHaveClass(
      "[&>ol]:[counter-reset:step]",
      "[&>ol]:list-none!",
    );
    await expectNoAxeViolations(container);
  });
});
