/**
 * @file tests/components/forms/TextInput.test.tsx
 * @desc Component tests for TextInput: label wiring, hint and error descriptions, aria-invalid,
 *       native props, className, ref, typing, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TextInput } from "../../../src/components/forms/TextInput.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("TextInput", () => {
  it("links a visible label to the input by id", () => {
    render(<TextInput id="pack-name" label="Pack name" />);
    const input = screen.getByLabelText("Pack name");
    expect(input).toHaveAttribute("id", "pack-name");
    expect(input.tagName).toBe("INPUT");
    expect(screen.getByText("Pack name")).toHaveClass("font-bold", "text-c3", "text-sm");
  });

  it("uses the shared field classes on the input", () => {
    render(<TextInput id="q" label="Search" />);
    expect(screen.getByRole("textbox", { name: "Search" })).toHaveClass(
      "w-full",
      "rounded-md",
      "border-b3",
      "bg-b6",
      "focus-visible:border-h1",
    );
  });

  it("has no description and is not invalid without a hint or error", () => {
    render(<TextInput id="q" label="Search" />);
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("describes the input with its hint", () => {
    render(<TextInput id="q" label="Search" hint="Pack name, host, or description" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "q-hint");
    expect(input).toHaveAccessibleDescription("Pack name, host, or description");
    expect(screen.getByText("Pack name, host, or description")).toHaveClass("text-c4", "text-xs");
  });

  it("marks the input invalid and describes it with the error, after the hint", () => {
    render(
      <TextInput id="key" label="Key" hint="Starts with pk1." error="That key is malformed." />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "key-hint key-error");
    expect(input).toHaveAccessibleDescription("Starts with pk1. That key is malformed.");
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("That key is malformed.");
    expect(alert).toHaveClass("text-rose-300", "text-sm");
  });

  it("keeps a caller aria-describedby and a caller aria-invalid", () => {
    render(
      <>
        <p id="extra">Extra help.</p>
        <TextInput id="q" label="Search" hint="Hint." aria-describedby="extra" aria-invalid />
      </>,
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-describedby", "q-hint extra");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("takes block content (a list of errors) in the hint and error without invalid nesting", () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <TextInput
        id="name"
        label="Name"
        hint={
          <ul>
            <li>Letters and digits</li>
          </ul>
        }
        error={
          <ul>
            <li>Too short.</li>
            <li>No spaces.</li>
          </ul>
        }
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Too short.No spaces.");
    expect(logged).not.toHaveBeenCalled();
    logged.mockRestore();
  });

  it("keeps both description ids whatever the control's id looks like", () => {
    render(<TextInput id="text" label="Text" hint="Hint." error="Error." />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "text-hint text-error");
  });

  it("passes native props through and takes a ref as a plain prop", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <TextInput
        ref={ref}
        id="q"
        label="Search"
        type="search"
        name="q"
        placeholder="Pack name"
        required
        disabled
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Search" });
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "q");
    expect(input).toHaveAttribute("placeholder", "Pack name");
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });

  it("appends className to the input and wrapperClassName to the wrapper", () => {
    const { container } = render(
      <TextInput id="q" label="Search" className="font-mono" wrapperClassName="min-w-48 flex-1" />,
    );
    expect(screen.getByRole("textbox").className.endsWith(" font-mono")).toBe(true);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("flex", "flex-col", "gap-1");
    expect(wrapper.className.endsWith(" min-w-48 flex-1")).toBe(true);
  });

  it("takes focus from its label and accepts typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextInput id="q" label="Search" onChange={onChange} />);
    await user.click(screen.getByText("Search"));
    const input = screen.getByRole("textbox");
    expect(input).toHaveFocus();
    await user.keyboard("aspire");
    expect(input).toHaveValue("aspire");
    expect(onChange).toHaveBeenCalledTimes(6);
  });

  it("is reachable with Tab", async () => {
    const user = userEvent.setup();
    render(<TextInput id="q" label="Search" />);
    await user.tab();
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("has no axe violations in its plain, hinted, invalid and disabled states", async () => {
    const { container } = render(
      <form>
        <TextInput id="a" label="Plain" />
        <TextInput id="b" label="Hinted" hint="Some help." />
        <TextInput id="c" label="Invalid" hint="Some help." error="Something is wrong." />
        <TextInput id="d" label="Disabled" disabled defaultValue="locked" />
      </form>,
    );
    await expectNoAxeViolations(container);
  });
});
