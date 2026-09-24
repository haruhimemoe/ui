/**
 * @file tests/components/forms/Select.test.tsx
 * @desc Component tests for Select: label wiring, options, hint and error descriptions,
 *       aria-invalid, native props, className, ref, keyboard use, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "../../../src/components/forms/Select.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const OPTIONS = (
  <>
    <option value="">No slot</option>
    <option value="NM">NM</option>
    <option value="HD">HD</option>
  </>
);

describe("Select", () => {
  it("links a visible label to the select and renders its options", () => {
    render(
      <Select id="slot" label="Slot">
        {OPTIONS}
      </Select>,
    );
    const select = screen.getByRole("combobox", { name: "Slot" });
    expect(select).toHaveAttribute("id", "slot");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(select).toHaveClass("w-full", "rounded-md", "bg-b6", "text-c1");
  });

  it("has no description and is not invalid without a hint or error", () => {
    render(
      <Select id="slot" label="Slot">
        {OPTIONS}
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).not.toHaveAttribute("aria-describedby");
    expect(select).not.toHaveAttribute("aria-invalid");
  });

  it("describes the select with its hint and error and marks it invalid", () => {
    render(
      <Select id="slot" label="Slot" hint="Where the map goes." error="Pick a slot.">
        {OPTIONS}
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-describedby", "slot-hint slot-error");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Where the map goes. Pick a slot.");
  });

  it("keeps a caller aria-describedby", () => {
    render(
      <>
        <p id="note">Note.</p>
        <Select id="slot" label="Slot" error="Pick one." aria-describedby="note">
          {OPTIONS}
        </Select>
      </>,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-describedby", "slot-error note");
  });

  it("passes native props through and takes a ref as a plain prop", () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} id="slot" label="Slot" name="slot" defaultValue="HD" disabled>
        {OPTIONS}
      </Select>,
    );
    const select = screen.getByRole("combobox");
    expect(ref.current).toBe(select);
    expect(select).toHaveAttribute("name", "slot");
    expect(select).toHaveValue("HD");
    expect(select).toBeDisabled();
  });

  it("appends className to the select and wrapperClassName to the wrapper", () => {
    const { container } = render(
      <Select id="slot" label="Slot" className="!w-auto" wrapperClassName="self-end">
        {OPTIONS}
      </Select>,
    );
    expect(screen.getByRole("combobox").className.endsWith(" !w-auto")).toBe(true);
    expect((container.firstElementChild as HTMLElement).className.endsWith(" self-end")).toBe(true);
  });

  it("is reachable with Tab and reports the picked option through onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select id="slot" label="Slot" onChange={(event) => onChange(event.currentTarget.value)}>
        {OPTIONS}
      </Select>,
    );
    await user.tab();
    const select = screen.getByRole("combobox");
    expect(select).toHaveFocus();
    await user.selectOptions(select, "NM");
    expect(select).toHaveValue("NM");
    expect(onChange).toHaveBeenCalledWith("NM");
  });

  it("has no axe violations in its plain, hinted, invalid and disabled states", async () => {
    const { container } = render(
      <form>
        <Select id="a" label="Plain">
          {OPTIONS}
        </Select>
        <Select id="b" label="Hinted" hint="Some help.">
          {OPTIONS}
        </Select>
        <Select id="c" label="Invalid" error="Something is wrong.">
          {OPTIONS}
        </Select>
        <Select id="d" label="Disabled" disabled>
          {OPTIONS}
        </Select>
      </form>,
    );
    await expectNoAxeViolations(container);
  });
});
