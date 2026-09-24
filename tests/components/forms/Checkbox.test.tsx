/**
 * @file tests/components/forms/Checkbox.test.tsx
 * @desc Component tests for Checkbox: the download-options look, name vs description, hint and
 *       error wiring, native props, className, ref, mouse and keyboard toggling, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../../../src/components/forms/Checkbox.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Checkbox", () => {
  it("takes a list of errors without invalid nesting", () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Checkbox
        id="terms"
        label="I agree"
        error={
          <ul>
            <li>Required.</li>
          </ul>
        }
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Required.");
    expect(logged).not.toHaveBeenCalled();
    logged.mockRestore();
  });

  it("renders a checkbox named by its label alone, described by its hint", () => {
    render(
      <Checkbox
        id="videos"
        label="Include videos"
        hint="Videos make packs several times larger."
      />,
    );
    const box = screen.getByRole("checkbox", { name: "Include videos" });
    expect(box).toHaveAttribute("id", "videos");
    expect(box).toHaveAttribute("type", "checkbox");
    expect(box).toHaveAttribute("aria-describedby", "videos-hint");
    expect(box).toHaveAccessibleDescription("Videos make packs several times larger.");
  });

  it("keeps the packs choice look: accent box, bold label, dimmer inline hint", () => {
    render(<Checkbox id="bg" label="Include backgrounds" hint="Turn this off to drop them." />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveClass("mt-1", "accent-h1");
    expect(box.closest("label")).toHaveClass("flex", "items-start", "gap-2", "text-sm");
    expect(screen.getByText("Include backgrounds")).toHaveClass("font-bold", "text-c1");
    const hintRow = screen.getByText("Turn this off to drop them.").parentElement as HTMLElement;
    expect(hintRow).toHaveClass("text-c3");
    expect(hintRow).toHaveTextContent("· Turn this off to drop them.");
  });

  it("has no hint row, description or invalid state by default", () => {
    render(<Checkbox id="x" label="Plain" />);
    const box = screen.getByRole("checkbox", { name: "Plain" });
    expect(box).not.toHaveAttribute("aria-describedby");
    expect(box).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("·", { exact: false })).toBeNull();
  });

  it("shows an error under the row, marks the box invalid and describes it", () => {
    render(<Checkbox id="terms" label="I agree" hint="Required." error="Tick this to go on." />);
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-invalid", "true");
    expect(box).toHaveAttribute("aria-describedby", "terms-hint terms-error");
    expect(box).toHaveAccessibleDescription("Required. Tick this to go on.");
    expect(screen.getByRole("alert")).toHaveClass("text-rose-300", "text-sm");
  });

  it("keeps a caller aria-describedby and a caller aria-invalid", () => {
    render(
      <>
        <p id="more">More.</p>
        <Checkbox id="x" label="Plain" aria-describedby="more" aria-invalid />
      </>,
    );
    const box = screen.getByRole("checkbox");
    expect(box).toHaveAttribute("aria-describedby", "more");
    expect(box).toHaveAttribute("aria-invalid", "true");
  });

  it("passes native props through and takes a ref as a plain prop", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} id="x" label="Plain" name="plain" defaultChecked disabled />);
    const box = screen.getByRole("checkbox");
    expect(ref.current).toBe(box);
    expect(box).toHaveAttribute("name", "plain");
    expect(box).toBeChecked();
    expect(box).toBeDisabled();
  });

  it("appends className to the box and wrapperClassName to the wrapper", () => {
    const { container } = render(
      <Checkbox id="x" label="Plain" className="size-4" wrapperClassName="mt-2" />,
    );
    expect(screen.getByRole("checkbox").className.endsWith(" size-4")).toBe(true);
    expect((container.firstElementChild as HTMLElement).className.endsWith(" mt-2")).toBe(true);
  });

  it("toggles from a click anywhere on the row, including the hint", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Checkbox
        id="videos"
        label="Include videos"
        hint="Bigger packs."
        onChange={(event) => onChange(event.currentTarget.checked)}
      />,
    );
    const box = screen.getByRole("checkbox");
    await user.click(screen.getByText("Include videos"));
    expect(box).toBeChecked();
    await user.click(screen.getByText("Bigger packs."));
    expect(box).not.toBeChecked();
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  it("toggles with Space after tabbing to it, and not when disabled", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Checkbox id="x" label="Plain" />);
    await user.tab();
    const box = screen.getByRole("checkbox");
    expect(box).toHaveFocus();
    await user.keyboard(" ");
    expect(box).toBeChecked();

    rerender(<Checkbox id="x" label="Plain" disabled />);
    await user.click(box);
    expect(box).toBeChecked();
  });

  it("has no axe violations in its plain, hinted, invalid, checked and disabled states", async () => {
    const { container } = render(
      <fieldset>
        <legend>Download options</legend>
        <Checkbox id="a" label="Plain" />
        <Checkbox id="b" label="Hinted" hint="Some help." />
        <Checkbox id="c" label="Invalid" hint="Some help." error="Something is wrong." />
        <Checkbox id="d" label="Checked" defaultChecked />
        <Checkbox id="e" label="Disabled" disabled />
      </fieldset>,
    );
    await expectNoAxeViolations(container);
  });
});
