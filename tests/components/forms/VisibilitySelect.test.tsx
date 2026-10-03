/**
 * @file tests/components/forms/VisibilitySelect.test.tsx
 * @desc Component tests for VisibilitySelect: radios with their lines, the select with the
 *       picked line as its hint, custom words, hint and error, disabled, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  VISIBILITIES,
  VISIBILITY_TEXT,
  VisibilitySelect,
} from "../../../src/components/forms/VisibilitySelect.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("VisibilitySelect", () => {
  it("lists the three, most closed first, with generic words", () => {
    expect(VISIBILITIES).toEqual(["private", "unlisted", "public"]);
    expect(VISIBILITY_TEXT.private.label).toBe("Private");
  });

  it("is a radio group by default, each radio described by its line", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<VisibilitySelect value="private" onChange={onChange} id="vis" />);
    expect(screen.getByRole("group", { name: "Who can see it" })).toBeInTheDocument();
    const priv = screen.getByRole("radio", { name: "Private" });
    expect(priv).toBeChecked();
    expect(priv).toHaveAttribute("name", "vis");
    expect(priv).toHaveAccessibleDescription("Only you can see it.");
    await user.click(screen.getByRole("radio", { name: "Public" }));
    expect(onChange).toHaveBeenCalledWith("public");
    await expectNoAxeViolations(container);
  });

  it("takes its own words, merged over the defaults", () => {
    render(
      <VisibilitySelect
        value="unlisted"
        onChange={() => {}}
        label="Who can see this pool"
        text={{ private: { hint: "Only you and your editors." }, public: { label: "Everyone" } }}
      />,
    );
    expect(screen.getByRole("group", { name: "Who can see this pool" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Private" })).toHaveAccessibleDescription(
      "Only you and your editors.",
    );
    expect(screen.getByRole("radio", { name: "Everyone" })).toBeInTheDocument();
  });

  it("as a select, labels it, shows the picked line and reports a pick", async () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <VisibilitySelect
        as="select"
        id="v"
        label="Who sees it"
        value="unlisted"
        onChange={onChange}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Who sees it" });
    expect(select).toHaveValue("unlisted");
    expect(select).toHaveAccessibleDescription(VISIBILITY_TEXT.unlisted.hint as string);
    fireEvent.change(select, { target: { value: "public" } });
    expect(onChange).toHaveBeenCalledWith("public");
    fireEvent.change(select, { target: { value: "bogus" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    await expectNoAxeViolations(container);
    rerender(
      <VisibilitySelect as="select" value="public" onChange={onChange} hint="Change it later." />,
    );
    expect(screen.getByRole("combobox")).toHaveAccessibleDescription("Change it later.");
  });

  it("passes error and disabled on", () => {
    const { rerender } = render(
      <VisibilitySelect value="private" onChange={() => {}} error="Pick one." disabled />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Pick one.");
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    rerender(<VisibilitySelect as="select" value="private" onChange={() => {}} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
