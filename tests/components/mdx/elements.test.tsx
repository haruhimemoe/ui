/**
 * @file tests/components/mdx/elements.test.tsx
 * @desc Component tests for the MDX element overrides (MdxLink, MdxH2/MdxH3, MdxPre, MdxTable,
 *       MdxBlockquote): react-markdown's `node` prop never reaches the DOM, link targets and
 *       rels, heading anchors and slugs, the code-fence hand-off to CodeBlock, the table's
 *       scroll-region labelling, callout blockquotes, and a composed-tree axe check.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "../../../src/components/mdx/CodeBlock.js";
import { MdxBlockquote } from "../../../src/components/mdx/MdxBlockquote.js";
import { MdxH2, MdxH3 } from "../../../src/components/mdx/MdxHeading.js";
import { MdxLink } from "../../../src/components/mdx/MdxLink.js";
import { MdxPre } from "../../../src/components/mdx/MdxPre.js";
import { MdxTable } from "../../../src/components/mdx/MdxTable.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("MdxLink", () => {
  it("renders an internal href through next/link with no target", () => {
    render(
      <MdxLink node={{}} href="/docs">
        Docs
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("node");
  });

  it("passes className, title and id through to next/link", () => {
    render(
      <MdxLink node={{}} href="/docs" className="x" title="Docs page" id="docs-link">
        Docs
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveClass("x");
    expect(link).toHaveAttribute("title", "Docs page");
    expect(link).toHaveAttribute("id", "docs-link");
  });

  it("opens an external https href in a new tab with a safe rel", () => {
    render(
      <MdxLink node={{}} href="https://osu.ppy.sh">
        osu!
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "osu!" });
    expect(link).toHaveAttribute("href", "https://osu.ppy.sh");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a same-page hash link plainly, with no target", () => {
    render(
      <MdxLink node={{}} href="#usage">
        Usage
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "Usage" });
    expect(link).toHaveAttribute("href", "#usage");
    expect(link).not.toHaveAttribute("target");
  });

  it("renders a mailto href plainly, with no target", () => {
    render(
      <MdxLink node={{}} href="mailto:a@b.c">
        Email
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "Email" });
    expect(link).toHaveAttribute("href", "mailto:a@b.c");
    expect(link).not.toHaveAttribute("target");
  });

  it("forwards aria-* and data-* props through to next/link for an internal href", () => {
    render(
      <MdxLink node={{}} href="/docs" aria-describedby="x" data-foo="1">
        Docs
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("aria-describedby", "x");
    expect(link).toHaveAttribute("data-foo", "1");
  });

  it("forwards aria-* and data-* props through on an external https href", () => {
    render(
      <MdxLink node={{}} href="https://osu.ppy.sh" aria-describedby="x" data-foo="1">
        osu!
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "osu!" });
    expect(link).toHaveAttribute("aria-describedby", "x");
    expect(link).toHaveAttribute("data-foo", "1");
  });

  it("forwards aria-* and data-* props through on a same-page hash href", () => {
    render(
      <MdxLink node={{}} href="#usage" aria-describedby="x" data-foo="1">
        Usage
      </MdxLink>,
    );
    const link = screen.getByRole("link", { name: "Usage" });
    expect(link).toHaveAttribute("aria-describedby", "x");
    expect(link).toHaveAttribute("data-foo", "1");
  });

  it("renders a plain anchor with no href attribute when href is undefined", () => {
    render(<MdxLink node={{}}>Named anchor</MdxLink>);
    const anchor = screen.getByText("Named anchor");
    expect(anchor.tagName).toBe("A");
    expect(anchor).not.toHaveAttribute("href");
  });
});

describe("MdxH2", () => {
  it("uses a given id for the heading and its anchor link", () => {
    render(
      <MdxH2 node={{}} id="usage">
        Usage
      </MdxH2>,
    );
    const heading = screen.getByRole("heading", { name: "Usage" });
    expect(heading.tagName).toBe("H2");
    expect(heading).toHaveAttribute("id", "usage");
    expect(heading).not.toHaveAttribute("node");
    const link = screen.getByRole("link", { name: "Link to section: Usage" });
    expect(link).toHaveAttribute("href", "#usage");
  });

  it("slugs the heading text when no id is given", () => {
    render(<MdxH2 node={{}}>Getting Started</MdxH2>);
    const heading = screen.getByRole("heading", { name: "Getting Started" });
    expect(heading).toHaveAttribute("id", "getting-started");
    expect(screen.getByRole("link", { name: "Link to section: Getting Started" })).toHaveAttribute(
      "href",
      "#getting-started",
    );
  });

  it("renders no anchor link when the text slugs to an empty string", () => {
    render(<MdxH2 node={{}}>!!!</MdxH2>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("MdxH3", () => {
  it("uses a given id for the heading and its anchor link", () => {
    render(
      <MdxH3 node={{}} id="usage">
        Usage
      </MdxH3>,
    );
    const heading = screen.getByRole("heading", { name: "Usage" });
    expect(heading.tagName).toBe("H3");
    expect(heading).toHaveAttribute("id", "usage");
    const link = screen.getByRole("link", { name: "Link to section: Usage" });
    expect(link).toHaveAttribute("href", "#usage");
  });

  it("slugs the heading text when no id is given", () => {
    render(<MdxH3 node={{}}>Getting Started</MdxH3>);
    expect(screen.getByRole("heading", { name: "Getting Started" })).toHaveAttribute(
      "id",
      "getting-started",
    );
  });

  it("renders no anchor link when the text slugs to an empty string", () => {
    render(<MdxH3 node={{}}>!!!</MdxH3>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("MdxPre", () => {
  it("hands a fenced code block to CodeBlock with its parsed meta", () => {
    const code = createElement(
      "code",
      { className: "language-ts", "data-meta": 'title="a.ts" {1}' },
      "const a = 1;\n",
    );
    const element = MdxPre({ node: {}, children: code });
    expect(element.type).toBe(CodeBlock);
    expect(element.props).toEqual({
      code: "const a = 1;\n",
      lang: "ts",
      title: "a.ts",
      highlight: [1],
    });
  });

  it("renders a plain, focusable pre when the child isn't a code element", () => {
    render(
      <MdxPre node={{}}>
        <span>not code</span>
      </MdxPre>,
    );
    const pre = screen.getByText("not code").closest("pre");
    expect(pre).toHaveAttribute("tabindex", "0");
    expect(pre).not.toHaveAttribute("node");
  });

  it("still detects a fence when an app overrides the code component", () => {
    function CustomCode(props: { className?: string; children?: unknown }) {
      return createElement("code", props);
    }
    const custom = createElement(CustomCode, { className: "language-ts" }, "const a = 1;\n");
    const element = MdxPre({ node: {}, children: custom });
    expect(element.type).toBe(CodeBlock);
    expect(element.props).toEqual({
      code: "const a = 1;\n",
      lang: "ts",
      title: undefined,
      highlight: [],
    });
  });

  it('reads the code fence meta from props["data-meta"]', () => {
    const code = createElement("code", { "data-meta": "{2-3}" }, "a\nb\nc\n");
    const element = MdxPre({ node: {}, children: code });
    expect(element.type).toBe(CodeBlock);
    expect(element.props.highlight).toEqual([2, 3]);
  });
});

describe("MdxTable", () => {
  it("wraps the table in a named, focusable scroll region", () => {
    render(
      <MdxTable node={{}}>
        <tbody>
          <tr>
            <td>a</td>
          </tr>
        </tbody>
      </MdxTable>,
    );
    const group = screen.getByRole("group", { name: "Table" });
    expect(group).toHaveAttribute("tabindex", "0");
    expect(group).not.toHaveAttribute("node");
    expect(group.querySelector("table")).not.toBeNull();
  });

  it("names the region from a caption child", () => {
    render(
      <MdxTable node={{}}>
        <caption>Mods</caption>
        <tbody>
          <tr>
            <td>a</td>
          </tr>
        </tbody>
      </MdxTable>,
    );
    expect(screen.getByRole("group", { name: "Mods" })).toBeInTheDocument();
  });
});

describe("MdxBlockquote", () => {
  it("renders a known callout type as a Callout", () => {
    render(
      <MdxBlockquote node={{}} data-callout="tip">
        Text
      </MdxBlockquote>,
    );
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Tip");
  });

  it("forwards className, id and other props to the rendered Callout", () => {
    render(
      <MdxBlockquote node={{}} data-callout="note" className="x" id="cb" data-foo="1">
        Text
      </MdxBlockquote>,
    );
    const note = screen.getByRole("note");
    expect(note).toHaveClass("x");
    expect(note).toHaveAttribute("id", "cb");
    expect(note).toHaveAttribute("data-foo", "1");
  });

  it("renders a plain blockquote with no data-callout attribute when none is given", () => {
    render(<MdxBlockquote node={{}}>Text</MdxBlockquote>);
    const quote = screen.getByText("Text").closest("blockquote");
    expect(quote).not.toBeNull();
    expect(quote).not.toHaveAttribute("data-callout");
    expect(quote).not.toHaveAttribute("node");
  });

  it("renders a plain blockquote for an unknown data-callout value", () => {
    render(
      <MdxBlockquote node={{}} data-callout="x">
        Text
      </MdxBlockquote>,
    );
    const quote = screen.getByText("Text").closest("blockquote");
    expect(quote).not.toBeNull();
    expect(screen.queryByRole("note")).not.toBeInTheDocument();
  });
});

describe("composed MDX tree", () => {
  it("is axe-clean with a heading, table, blockquote and link together", async () => {
    const { container } = render(
      <main>
        <MdxH2 node={{}} id="usage">
          Usage
        </MdxH2>
        <MdxTable node={{}}>
          <caption>Mods</caption>
          <tbody>
            <tr>
              <td>a</td>
            </tr>
          </tbody>
        </MdxTable>
        <MdxBlockquote node={{}} data-callout="note">
          Text
        </MdxBlockquote>
        <MdxLink node={{}} href="/docs">
          Docs
        </MdxLink>
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
