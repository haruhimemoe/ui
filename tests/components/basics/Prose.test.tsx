/**
 * @file tests/components/basics/Prose.test.tsx
 * @desc Component tests for Prose: typography classes, no top margin on the element that opens
 *       the block (checked against Tailwind's generated CSS), children, native props, className,
 *       ref, accessibility of typical Markdown output.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Thu Sep 24, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";
import { Prose } from "../../../src/components/basics/Prose.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

/** The CSS Tailwind generates for an element's classes, on one line (utilities only). */
const cssFor = async (element: Element): Promise<string> =>
  (await compile("@theme { --spacing: 0.25rem; } @tailwind utilities;"))
    .build([...element.classList])
    .replace(/\s+/g, " ");

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

  it("zeroes the top margin of the element that opens the block, so a heading there sits flush", async () => {
    render(
      <Prose data-testid="prose">
        <h2>Privacy</h2>
        <p>Text</p>
      </Prose>,
    );
    const prose = screen.getByTestId("prose");
    expect(prose).toHaveClass("[&>:first-child]:mt-0", "[&_h2]:mt-10", "[&_p]:mt-3");
    // `.prose > :first-child` (a class and a pseudo-class) outranks `.prose h2` (a class and an
    // element), so the opening heading loses its margin wherever the rules land in the sheet.
    const css = await cssFor(prose);
    expect(css).toContain(
      String.raw`.\[\&\>\:first-child\]\:mt-0 > :first-child { margin-top: 0px; }`,
    );
    expect(css).toContain(
      String.raw`.\[\&_h2\]\:mt-10 h2 { margin-top: calc(var(--spacing) * 10); }`,
    );
  });

  it("keeps its first-child rule next to the caller's rule for a heading inside a first section", async () => {
    render(
      <Prose data-testid="prose" className="[&>:first-child>:first-child]:mt-0">
        <section>
          <h2>What we store</h2>
        </section>
      </Prose>,
    );
    const prose = screen.getByTestId("prose");
    expect(prose).toHaveClass("[&>:first-child]:mt-0", "[&>:first-child>:first-child]:mt-0");
    expect(await cssFor(prose)).toContain("> :first-child > :first-child { margin-top: 0px; }");
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
