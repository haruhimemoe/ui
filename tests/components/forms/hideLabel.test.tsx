/**
 * @file tests/components/forms/hideLabel.test.tsx
 * @desc hideLabel on every field: the label is sr-only and still names the control, the hint and
 *       error stay linked, the prop never reaches the DOM, Checkbox drops its separator, the
 *       RadioGroup legend stays the group's name, the rows grow on coarse pointers, axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { Checkbox } from "../../../src/components/forms/Checkbox.js";
import { RadioGroup } from "../../../src/components/forms/RadioGroup.js";
import { Select } from "../../../src/components/forms/Select.js";
import { Textarea } from "../../../src/components/forms/Textarea.js";
import { TextInput } from "../../../src/components/forms/TextInput.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

let consoleError: MockInstance;
beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => consoleError.mockRestore());

describe("hideLabel on TextInput, Select and Textarea", () => {
  it("hides the label visually but keeps it as the name, with hint and error linked", async () => {
    const { container } = render(
      <form>
        <TextInput id="code" label="New code" hideLabel hint="Two letters." error="Taken." />
        <Select id="mode" label="Mode" hideLabel defaultValue="osu">
          <option value="osu">osu!</option>
        </Select>
        <Textarea id="notes" label="Notes" hideLabel />
      </form>,
    );
    for (const name of ["New code", "Mode", "Notes"]) {
      const control = screen.getByLabelText(name);
      expect(container.querySelector(`label[for="${control.id}"]`)).toHaveClass("sr-only");
      expect(control).not.toHaveAttribute("hidelabel");
      expect(control).not.toHaveAttribute("hideLabel");
    }
    const code = screen.getByLabelText("New code");
    expect(code).toHaveAttribute("aria-describedby", "code-hint code-error");
    expect(code).toHaveAttribute("aria-invalid", "true");
    expect(consoleError).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("shows the label without hideLabel", () => {
    const { container } = render(<TextInput id="name" label="Name" />);
    expect(container.querySelector('label[for="name"]')).not.toHaveClass("sr-only");
  });
});

describe("hideLabel on Checkbox", () => {
  it("hides the label text, keeps the name and shows the hint with no separator", async () => {
    const { container } = render(
      <Checkbox id="video" label="Include video" hint="Bigger download" hideLabel />,
    );
    const box = screen.getByRole("checkbox", { name: "Include video" });
    expect(box).not.toHaveAttribute("hidelabel");
    expect(screen.getByText("Include video")).toHaveClass("sr-only");
    expect(screen.getByText("Bigger download")).toBeVisible();
    expect(container.textContent).not.toContain("·");
    expect(consoleError).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });
});

describe("hideLabel on RadioGroup", () => {
  it("hides the legend, which still names the group", async () => {
    const { container } = render(
      <RadioGroup
        label="Who can see this pool"
        hideLabel
        options={[
          { value: "private", label: "Private" },
          { value: "public", label: "Public" },
        ]}
        defaultValue="private"
      />,
    );
    expect(screen.getByRole("group", { name: "Who can see this pool" })).toBeInTheDocument();
    expect(container.querySelector("legend")).toHaveClass("sr-only");
    await expectNoAxeViolations(container);
  });
});

describe("touch rows", () => {
  it("pads checkbox and radio rows to 44px on a coarse pointer", () => {
    const { container } = render(
      <div>
        <Checkbox id="a" label="A" />
        <RadioGroup label="B" options={[{ value: "b", label: "B" }]} />
      </div>,
    );
    for (const label of container.querySelectorAll("label")) {
      expect(label).toHaveClass("coarse:py-2.5");
    }
  });
});
