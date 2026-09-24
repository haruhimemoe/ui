/**
 * @file tests/components/basics/Prose.test.tsx
 * @desc Component tests for Prose: typography classes, children, native props, className, ref,
 *       accessibility of typical Markdown output.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Prose } from "../../../src/components/basics/Prose.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Prose", () => {
  it("wraps children in a readable-width div with the element styles", () => {
    render(
      <Prose data-testid="prose">
        <p>Hello</p>
      </Prose>,
    );
    const prose = screen.getByTestId("prose");
    expect(prose.tagName).toBe("DIV");
    expect(prose).toHaveClass(
      "max-w-3xl",
      "text-c2",
      "leading-relaxed",
      "[&_a]:text-h1",
      "[&_h2]:text-2xl",
      "[&_pre]:bg-b6",
      "[&_th]:text-left",
    );
    expect(screen.getByText("Hello").parentElement).toBe(prose);
  });

  it("appends a caller className and passes native props and ref through", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Prose ref={ref} className="mx-auto" id="content" lang="en">
        <p>Text</p>
      </Prose>,
    );
    expect(ref.current).toHaveAttribute("id", "content");
    expect(ref.current).toHaveAttribute("lang", "en");
    expect(ref.current?.className.endsWith(" mx-auto")).toBe(true);
  });

  it("has no axe violations around typical Markdown output", async () => {
    const { container } = render(
      <main>
        <Prose>
          <h2>Privacy</h2>
          <p>
            We store your <strong>osu! id</strong>. See <a href="/terms">the terms</a>.
          </p>
          <ul>
            <li>One</li>
          </ul>
          <pre>
            <code>curl /api/packs</code>
          </pre>
          <table>
            <thead>
              <tr>
                <th>Field</th>
                <th>Kept</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>id</td>
                <td>yes</td>
              </tr>
            </tbody>
          </table>
        </Prose>
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
