/**
 * @file tests/components/forms/Textarea.test.tsx
 * @desc Component tests for Textarea: label wiring, hint and error descriptions, aria-invalid,
 *       native props, className, ref, typing, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Textarea } from "../../../src/components/forms/Textarea.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Textarea", () => {
  it("links a visible label to the textarea by id", () => {
    render(<Textarea id="desc" label="Description (optional)" />);
    const textarea = screen.getByRole("textbox", { name: "Description (optional)" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("id", "desc");
  });

  it("uses the shared field classes, a minimum height and vertical resizing", () => {
    render(<Textarea id="desc" label="Description" />);
    expect(screen.getByRole("textbox")).toHaveClass(
      "w-full",
      "rounded-md",
      "bg-b6",
      "min-h-24",
      "resize-y",
    );
  });

  it("has no description and is not invalid without a hint or error", () => {
    render(<Textarea id="desc" label="Description" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).not.toHaveAttribute("aria-describedby");
    expect(textarea).not.toHaveAttribute("aria-invalid");
  });

  it("describes the textarea with its hint and error and marks it invalid", () => {
    render(<Textarea id="desc" label="Description" hint="12/500" error="Too long." />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-describedby", "desc-hint desc-error");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("12/500 Too long.");
    expect(screen.getByRole("alert")).toHaveTextContent("Too long.");
  });

  it("keeps a caller aria-describedby and a caller aria-invalid", () => {
    render(
      <>
        <p id="count">0/500</p>
        <Textarea id="desc" label="Description" aria-describedby="count" aria-invalid="true" />
      </>,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-describedby", "count");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("passes native props through and takes a ref as a plain prop", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Textarea
        ref={ref}
        id="desc"
        label="Description"
        rows={4}
        maxLength={500}
        name="description"
        disabled
      />,
    );
    const textarea = screen.getByRole("textbox");
    expect(ref.current).toBe(textarea);
    expect(textarea).toHaveAttribute("rows", "4");
    expect(textarea).toHaveAttribute("maxlength", "500");
    expect(textarea).toHaveAttribute("name", "description");
    expect(textarea).toBeDisabled();
  });

  it("appends className to the textarea and wrapperClassName to the wrapper", () => {
    const { container } = render(
      <Textarea id="desc" label="Description" className="font-mono" wrapperClassName="w-96" />,
    );
    expect(screen.getByRole("textbox").className.endsWith(" font-mono")).toBe(true);
    expect((container.firstElementChild as HTMLElement).className.endsWith(" w-96")).toBe(true);
  });

  it("accepts typing across lines from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Textarea id="desc" label="Description" />);
    await user.tab();
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveFocus();
    await user.keyboard("line one{Enter}line two");
    expect(textarea).toHaveValue("line one\nline two");
  });

  it("has no axe violations in its plain, hinted, invalid and disabled states", async () => {
    const { container } = render(
      <form>
        <Textarea id="a" label="Plain" />
        <Textarea id="b" label="Hinted" hint="Some help." />
        <Textarea id="c" label="Invalid" error="Something is wrong." />
        <Textarea id="d" label="Disabled" disabled />
      </form>,
    );
    await expectNoAxeViolations(container);
  });
});
