/**
 * @file tests/components/basics/Prose.test.tsx
 * @desc Component tests for Prose: typography classes, no top margin on the element that opens
 *       the block (checked against Tailwind's generated CSS), children, native props, className,
 *       ref, accessibility of typical Markdown output, the 0.17.0 element additions (h4, dl,
 *       figures, task lists, footnotes, details), and the size prop.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";
import { Prose } from "../../../src/components/basics/Prose.js";
import { PROSE_CLASSES } from "../../../src/components/basics/proseStyles.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

/** 0.11.0's `Prose.tsx:31` string, pinned so the 0.17.0 rewrite loses nothing. */
const OLD =
  "max-w-3xl text-c2 leading-relaxed [&>:first-child]:mt-0 [&_a:hover]:text-c1 [&_a]:text-h1 [&_a]:underline [&_blockquote]:mt-3 [&_blockquote]:border-b2 [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:text-c3 [&_code]:rounded [&_code]:bg-b4 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:text-c1 [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-c1 [&_h3]:text-lg [&_hr]:my-8 [&_hr]:border-b3 [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3 [&_pre:not([role=group])]:mt-3 [&_pre:not([role=group])]:overflow-x-auto [&_pre:not([role=group])]:rounded-md [&_pre:not([role=group])]:bg-b6 [&_pre:not([role=group])]:p-3 [&_pre:not([role=group])]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:text-c1 [&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_td]:border-b3 [&_td]:border-b [&_td]:px-2 [&_td]:py-1.5 [&_th]:border-b3 [&_th]:border-b [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-c1 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6";

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
      "[&_pre:not([role=group])]:bg-b6",
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

  it("styles a nested pre (e.g. inside li or blockquote), leaving pre code alone", () => {
    render(
      <Prose data-testid="prose">
        <blockquote>
          <pre>
            <code>x</code>
          </pre>
        </blockquote>
      </Prose>,
    );
    const prose = screen.getByTestId("prose");
    expect(prose.className).toContain("[&_pre:not([role=group])]:bg-b6");
    expect(prose.className).toContain("[&_pre_code]:bg-transparent");
  });

  it("leaves a CodeBlock-rendered pre (role=group) untouched", () => {
    render(
      <Prose data-testid="prose">
        {/* biome-ignore lint/a11y/useSemanticElements: mirrors CodeBlock's own pre exactly */}
        {/* biome-ignore lint/a11y/noNoninteractiveTabindex: mirrors CodeBlock's own pre */}
        <pre role="group" tabIndex={0} data-testid="code-pre">
          <code>x</code>
        </pre>
      </Prose>,
    );
    const prose = screen.getByTestId("prose");
    expect(prose.className).toContain("[&_pre:not([role=group])]:bg-b6");
    // The selector excludes role=group, so this pre never matches the Prose fence rule.
    expect(screen.getByTestId("code-pre")).toBeInTheDocument();
  });

  it("styles blockquotes", () => {
    render(
      <Prose data-testid="prose">
        <blockquote>Text</blockquote>
      </Prose>,
    );
    expect(screen.getByTestId("prose")).toHaveClass("[&_blockquote]:border-l-2");
  });

  it("pins 0.11.0's classes so the 0.17.0 rewrite loses nothing", () => {
    expect(PROSE_CLASSES.split(" ")).toEqual(expect.arrayContaining(OLD.split(" ")));
  });

  it("styles h4, dl, figures, task lists, footnotes and details, and scroll-margins ids", () => {
    render(
      <Prose data-testid="p">
        <p>x</p>
      </Prose>,
    );
    expect(screen.getByTestId("p")).toHaveClass(
      "[&_h4]:mt-5",
      "[&_h4]:font-bold",
      "[&_[id]]:scroll-mt-6",
      "[&_dt]:font-bold",
      "[&_dd]:pl-4",
      "[&_figure]:mt-4",
      "[&_figcaption]:text-sm",
      "[&_.contains-task-list]:list-none",
      "[&_.task-list-item]:flex",
      "[&_.task-list-item_input]:accent-h1",
      "[&_section.footnotes]:border-t",
      "[&_[data-footnote-ref]]:no-underline",
      "[&_li:target]:bg-b4",
      "[&_li:target]:border-l-2",
      "[&_details]:mt-3",
      "[&_summary]:cursor-pointer",
      "[&>section:first-child>:first-child]:mt-0",
    );
  });

  it("is base size by default and text-sm with size sm", () => {
    const { rerender } = render(
      <Prose data-testid="p">
        <p>x</p>
      </Prose>,
    );
    expect(screen.getByTestId("p")).not.toHaveClass("text-sm");
    rerender(
      <Prose data-testid="p" size="sm">
        <p>x</p>
      </Prose>,
    );
    expect(screen.getByTestId("p")).toHaveClass("text-sm");
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
