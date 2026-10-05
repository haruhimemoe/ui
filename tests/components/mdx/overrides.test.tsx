/**
 * @file tests/components/mdx/overrides.test.tsx
 * @desc The 0.17.0 MDX element overrides: h4 anchor, the footnote label h2 with no anchor, lazy
 *       images, native details styled like Disclosure, kbd without react-markdown's node prop,
 *       named task checkboxes, and data-embed divs routed to Embed. Axe on each.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { mdxComponents } from "../../../src/components/mdx/mdxComponents.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const {
  h2: H2,
  h4: H4,
  img: Img,
  details: Details,
  kbd: Kbd,
  input: Input,
  div: Div,
} = mdxComponents;

describe("MDX overrides", () => {
  it("gives an h4 an id and a section anchor", async () => {
    const { container } = render(
      <H4 node={{}} id="rolls">
        Rolls
      </H4>,
    );
    expect(screen.getByRole("heading", { level: 4, name: "Rolls" })).toHaveAttribute("id", "rolls");
    expect(screen.getByRole("link", { name: "Link to section: Rolls" })).toHaveAttribute(
      "href",
      "#rolls",
    );
    await expectNoAxeViolations(container);
  });

  it("renders the footnote label h2 bare: sr-only, no wrapper, no anchor", () => {
    const { container } = render(
      <H2 node={{}} id="footnote-label" className="sr-only">
        Footnotes
      </H2>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Footnotes" });
    expect(heading).toHaveClass("sr-only");
    expect(container.firstElementChild).toBe(heading);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders a lazy, async-decoded, rounded image with sizes forwarded and no node attribute", async () => {
    const { container } = render(
      <Img node={{}} src="/a.png" alt="Lobby" width={640} height={360} />,
    );
    const img = screen.getByRole("img", { name: "Lobby" });
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(img).toHaveAttribute("width", "640");
    expect(img).toHaveClass("max-w-full", "rounded-md");
    expect(img).not.toHaveAttribute("node");
    await expectNoAxeViolations(container);
  });

  it("renders a native details (no script, closed by default) with Disclosure's summary look, arrows hidden", async () => {
    const { container } = render(
      <Details node={{}}>
        <summary>Why seeding?</summary>
        <p>Because.</p>
      </Details>,
    );
    const details = container.querySelector("details");
    const summary = screen.getByText("Why seeding?").closest("summary");
    expect(details?.firstElementChild).toBe(summary);
    expect(summary).toHaveClass("cursor-pointer", "font-bold", "list-none");
    expect(summary?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("Because.")).toBeInTheDocument(); // in the DOM, so find-in-page reaches it
    await expectNoAxeViolations(container);
  });

  it("keeps an open attribute", () => {
    const { container } = render(
      <Details node={{}} open>
        <summary>S</summary>
      </Details>,
    );
    expect(container.querySelector("details")).toHaveAttribute("open");
  });

  it("renders kbd through Kbd without the node prop", () => {
    render(<Kbd node={{}}>Ctrl</Kbd>);
    const kbd = screen.getByText("Ctrl");
    expect(kbd.tagName).toBe("KBD");
    expect(kbd).toHaveClass("bg-b5");
    expect(kbd).not.toHaveAttribute("node");
  });

  it("names task checkboxes Done and Not done, disabled", async () => {
    const { container } = render(
      <ul className="contains-task-list">
        <li className="task-list-item">
          <Input node={{}} type="checkbox" checked disabled /> Book the referee
        </li>
        <li className="task-list-item">
          <Input node={{}} type="checkbox" disabled /> Post the schedule
        </li>
      </ul>,
    );
    expect(screen.getByRole("checkbox", { name: "Done" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Not done" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Done" })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it("passes other inputs through", () => {
    render(<Input node={{}} type="text" aria-label="Name" />);
    expect(screen.getByRole("textbox", { name: "Name" })).toBeInTheDocument();
  });

  it("routes a data-embed div to Embed and leaves other divs plain", () => {
    const { container, rerender } = render(
      <Div node={{}} data-embed="https://youtu.be/dQw4w9WgXcQ">
        <a href="x">fallback</a>
      </Div>,
    );
    expect(screen.getByRole("link", { name: "Play video: YouTube video" })).toBeInTheDocument();
    expect(screen.queryByText("fallback")).toBeNull();
    rerender(
      <Div node={{}} className="note">
        Plain
      </Div>,
    );
    expect(container.querySelector("div.note")?.textContent).toBe("Plain");
  });
});
