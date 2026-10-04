/**
 * @file tests/components/mdx/CodeBlock.test.tsx
 * @desc Component tests for CodeBlock: Shiki highlighting, title and language fallbacks, line
 *       highlighting, code text edge cases (trailing newline, CRLF, empty lines, empty code),
 *       unknown languages, the no-Shiki fallback, the copy button, and accessibility. The real
 *       highlighter stays cached across tests except in the fallback describe, which resets it.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock } from "../../../src/components/mdx/CodeBlock.js";
import { getHighlighter, resetHighlighter } from "../../../src/components/mdx/highlighter.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

let original: PropertyDescriptor | undefined;

beforeEach(() => {
  original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
});

afterEach(() => {
  if (original) Object.defineProperty(navigator, "clipboard", original);
  else Reflect.deleteProperty(navigator, "clipboard");
  vi.restoreAllMocks();
});

const setupClipboard = () => {
  const user = userEvent.setup();
  const writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  return { user, writeText };
};

describe("CodeBlock", () => {
  it("highlights ts code and names the pre by language", async () => {
    const { container } = render(await CodeBlock({ code: "const x = 1;", lang: "ts" }));
    const styled = [...container.querySelectorAll("span[style]")].some((span) =>
      (span.getAttribute("style") ?? "").includes("var(--shiki-token-keyword)"),
    );
    expect(styled).toBe(true);
    const pre = screen.getByRole("group", { name: "Code: ts" });
    expect(pre.tagName).toBe("PRE");
    expect(pre).toHaveAttribute("tabindex", "0");
  }, 20000);

  it("shows a title in the header, pre name, and copy button name", async () => {
    render(await CodeBlock({ code: "a", lang: "ts", title: "x.ts" }));
    expect(screen.getByText("x.ts")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Code: x.ts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy x.ts" })).toBeInTheDocument();
  });

  it("falls back to generic names with no title and no lang", async () => {
    render(await CodeBlock({ code: "a" }));
    expect(screen.getByText("Code")).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Code" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("marks exactly the highlighted line", async () => {
    const { container } = render(await CodeBlock({ code: "a\nb\nc", lang: "ts", highlight: [2] }));
    const lines = container.querySelectorAll("pre > code > span");
    expect(lines).toHaveLength(3);
    const highlighted = [...lines].filter((line) => line.hasAttribute("data-highlighted"));
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]).toBe(lines[1]);
    expect(highlighted[0]?.className).toContain("border-h1");
    expect(highlighted[0]?.className).not.toContain("border-transparent");
    for (const line of [lines[0], lines[2]]) {
      expect(line?.className).toContain("border-transparent");
      expect(line?.className).not.toContain("border-h1");
    }
  });

  it("renders one empty line for empty code, and stays axe-clean", async () => {
    const { container } = render(await CodeBlock({ code: "" }));
    const lines = container.querySelectorAll("pre > code > span");
    expect(lines).toHaveLength(1);
    await expectNoAxeViolations(container);
  });

  it("drops a trailing newline so there's no phantom last line", async () => {
    const { container } = render(await CodeBlock({ code: "a\nb\n" }));
    expect(container.querySelectorAll("pre > code > span")).toHaveLength(2);
  });

  it("strips \\r from CRLF line endings", async () => {
    const { container } = render(await CodeBlock({ code: "a\r\nb" }));
    expect(container.querySelector("pre")?.textContent).not.toContain("\r");
  });

  it("keeps an empty middle line with its height class", async () => {
    const { container } = render(await CodeBlock({ code: "a\n\nb" }));
    const lines = container.querySelectorAll("pre > code > span");
    expect(lines).toHaveLength(3);
    expect(lines[1]?.className).toContain("min-h-6");
  });

  it("renders plain lines with no shiki styling for an unknown language", async () => {
    const { container } = render(await CodeBlock({ code: "a\nb", lang: "brainfuck" }));
    expect(screen.getByText("brainfuck")).toBeInTheDocument();
    const styled = [...container.querySelectorAll("span[style]")].some((span) =>
      (span.getAttribute("style") ?? "").includes("var(--shiki-"),
    );
    expect(styled).toBe(false);
    expect(container.querySelectorAll("pre > code > span")).toHaveLength(2);
  });

  it("copies the exact code, trailing newline trimmed, when the button is pressed", async () => {
    const { user, writeText } = setupClipboard();
    render(await CodeBlock({ code: "const x = 1;\n", lang: "ts" }));
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenCalledWith("const x = 1;");
  });

  it("is axe-clean when highlighted", async () => {
    const { container } = render(
      await CodeBlock({ code: "const x = 1;", lang: "ts", title: "x.ts" }),
    );
    await expectNoAxeViolations(container);
  });

  describe("without Shiki", () => {
    afterEach(() => {
      resetHighlighter();
    });

    it("falls back to plain lines when Shiki fails to load", async () => {
      resetHighlighter();
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      await getHighlighter(() => Promise.reject(new Error("x")));
      const { container } = render(await CodeBlock({ code: "const x = 1;", lang: "ts" }));
      expect(warn).toHaveBeenCalled();
      const styled = [...container.querySelectorAll("span[style]")].some((span) =>
        (span.getAttribute("style") ?? "").includes("var(--shiki-"),
      );
      expect(styled).toBe(false);
      expect(container.querySelectorAll("pre > code > span")).toHaveLength(1);
    });

    it("is axe-clean in the fallback", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      await getHighlighter(() => Promise.reject(new Error("x")));
      const { container } = render(await CodeBlock({ code: "const x = 1;", lang: "ts" }));
      expect(warn).toHaveBeenCalled();
      await expectNoAxeViolations(container);
    });
  });
});
