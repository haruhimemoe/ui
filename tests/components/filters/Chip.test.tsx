/**
 * @file tests/components/filters/Chip.test.tsx
 * @desc Component tests for Chip: aria-pressed, pressed and unpressed looks, toggling by click and
 *       keyboard, the caller's onClick, disabled state, native props, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "../../../src/components/filters/Chip.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

function ToggleChip({ onPressedChange }: { onPressedChange?: (pressed: boolean) => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <Chip
      pressed={pressed}
      onPressedChange={(next) => {
        setPressed(next);
        onPressedChange?.(next);
      }}
    >
      HR
    </Chip>
  );
}

describe("Chip", () => {
  it("is a toggle button that never submits a surrounding form", () => {
    render(<Chip pressed={false}>HD</Chip>);
    const chip = screen.getByRole("button", { name: "HD", pressed: false });
    expect(chip).toHaveAttribute("type", "button");
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("uses the pink highlight when pressed and the dark pill when not", () => {
    const { rerender } = render(<Chip pressed={false}>DT</Chip>);
    const chip = screen.getByRole("button");
    expect(chip).toHaveClass("rounded-full", "font-bold", "text-xs", "bg-b3", "text-c2");
    expect(chip).not.toHaveClass("bg-h1");

    rerender(<Chip pressed>DT</Chip>);
    expect(screen.getByRole("button", { pressed: true })).toHaveClass("bg-h1", "text-b6");
    expect(chip).not.toHaveClass("bg-b3", "text-c2");
  });

  it("tells pressed from unpressed in forced-colors mode with the system highlight", () => {
    const { rerender } = render(<Chip pressed={false}>DT</Chip>);
    const chip = screen.getByRole("button");
    expect(chip).not.toHaveClass("forced-colors:bg-[Highlight]");
    rerender(<Chip pressed>DT</Chip>);
    expect(chip).toHaveClass("forced-colors:bg-[Highlight]", "forced-colors:text-[HighlightText]");
  });

  it("reports the opposite state on click", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const { rerender } = render(
      <Chip pressed={false} onPressedChange={onPressedChange}>
        FL
      </Chip>,
    );
    await user.click(screen.getByRole("button"));
    expect(onPressedChange).toHaveBeenLastCalledWith(true);

    rerender(
      <Chip pressed onPressedChange={onPressedChange}>
        FL
      </Chip>,
    );
    await user.click(screen.getByRole("button"));
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
  });

  it("toggles with Enter and Space once focused by Tab", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(<ToggleChip onPressedChange={onPressedChange} />);

    await user.tab();
    const chip = screen.getByRole("button", { name: "HR" });
    expect(chip).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(chip).toHaveAttribute("aria-pressed", "true");
    await user.keyboard(" ");
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange.mock.calls).toEqual([[true], [false]]);
  });

  it("runs the caller's onClick first; preventDefault there skips the toggle", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Chip pressed={false} onClick={onClick} onPressedChange={onPressedChange}>
        EZ
      </Chip>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it("still toggles after a caller's onClick that lets the default happen", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onPressedChange = vi.fn();
    render(
      <Chip pressed={false} onClick={onClick} onPressedChange={onPressedChange}>
        HT
      </Chip>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("clicks without an onPressedChange do nothing and do not throw", async () => {
    const user = userEvent.setup();
    render(<Chip pressed={false}>NM</Chip>);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("does not toggle when disabled, and dims without a hover color", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <Chip pressed={false} disabled onPressedChange={onPressedChange}>
        TB
      </Chip>,
    );
    const chip = screen.getByRole("button");
    expect(chip).toBeDisabled();
    expect(chip).toHaveClass("disabled:opacity-40", "disabled:cursor-not-allowed");
    expect(chip).toHaveClass("not-disabled:hover:bg-b2");
    expect(chip).not.toHaveClass("hover:bg-b2");
    await user.click(chip);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it("appends a caller className after the built-in classes", () => {
    render(
      <Chip pressed={false} className="uppercase">
        osu!
      </Chip>,
    );
    expect(screen.getByRole("button").className.endsWith(" uppercase")).toBe(true);
  });

  it("passes native props through and takes a ref as a plain prop", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Chip ref={ref} pressed title="Hard Rock" data-testid="hr">
        HR
      </Chip>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "HR" }));
    expect(ref.current).toHaveAttribute("title", "Hard Rock");
    expect(ref.current).toHaveAttribute("data-testid", "hr");
  });

  it("has no axe violations pressed, unpressed or disabled", async () => {
    const { container } = render(
      <div>
        <Chip pressed>HD</Chip>
        <Chip pressed={false}>HR</Chip>
        <Chip pressed={false} disabled>
          DT
        </Chip>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});
