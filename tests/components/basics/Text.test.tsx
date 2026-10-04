/**
 * @file tests/components/basics/Text.test.tsx
 * @desc Component tests for Text and textClasses: every tone and size, bold, the element, the
 *       caller's className winning, the ref, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Text } from "../../../src/components/basics/Text.js";
import { textClasses } from "../../../src/components/basics/textStyles.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("textClasses", () => {
  it("defaults to c2 at text-sm", () => {
    expect(textClasses()).toBe("text-c2 text-sm");
  });

  it("maps every tone, with a lighter step for status tones under more contrast", () => {
    expect(textClasses({ tone: "muted" })).toBe("text-c3 text-sm");
    expect(textClasses({ tone: "subtle" })).toBe("text-c4 text-sm");
    expect(textClasses({ tone: "error" })).toBe(
      "text-rose-300 contrast-more:text-rose-200 text-sm",
    );
    expect(textClasses({ tone: "warning" })).toBe(
      "text-amber-300 contrast-more:text-amber-200 text-sm",
    );
    expect(textClasses({ tone: "success" })).toBe(
      "text-emerald-300 contrast-more:text-emerald-200 text-sm",
    );
  });

  it("maps every size and bold", () => {
    expect(textClasses({ size: "xs" })).toBe("text-c2 text-xs");
    expect(textClasses({ size: "base", bold: true })).toBe("text-c2 text-base font-bold");
  });

  it("lets the caller's className replace the tone color and the size", () => {
    const classes = textClasses({ tone: "error", className: "text-c1 text-lg" }).split(" ");
    expect(classes).toEqual(expect.arrayContaining(["text-c1", "text-lg"]));
    expect(classes).not.toContain("text-rose-300");
    expect(classes).not.toContain("text-sm");
  });
});

describe("Text", () => {
  it("renders a paragraph by default, a span or a div with as", () => {
    render(
      <div>
        <Text>Para</Text>
        <Text as="span" tone="warning">
          Span
        </Text>
        <Text as="div" tone="muted" size="xs" bold>
          Div
        </Text>
      </div>,
    );
    expect(screen.getByText("Para").tagName).toBe("P");
    expect(screen.getByText("Para")).toHaveClass("text-c2", "text-sm");
    expect(screen.getByText("Span").tagName).toBe("SPAN");
    expect(screen.getByText("Span")).toHaveClass("text-amber-300");
    expect(screen.getByText("Div").tagName).toBe("DIV");
    expect(screen.getByText("Div")).toHaveClass("text-c3", "text-xs", "font-bold");
  });

  it("passes native props through, puts className last and takes a ref", () => {
    const ref = createRef<HTMLParagraphElement>();
    render(
      <Text ref={ref} role="alert" tone="error" className="mt-2 text-c1" data-row="1">
        Broke
      </Text>,
    );
    expect(ref.current).toBe(screen.getByRole("alert"));
    expect(ref.current).toHaveClass("mt-2", "text-c1");
    expect(ref.current).not.toHaveClass("text-rose-300");
    expect(ref.current).toHaveAttribute("data-row", "1");
  });

  it("has no axe violations in every tone", async () => {
    const { container } = render(
      <div>
        {(["default", "muted", "subtle", "error", "warning", "success"] as const).map((tone) => (
          <Text key={tone} tone={tone}>
            {tone}
          </Text>
        ))}
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
