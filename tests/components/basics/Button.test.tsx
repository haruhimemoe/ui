/**
 * @file tests/components/basics/Button.test.tsx
 * @desc Component tests for Button and buttonClasses: defaults, variants, sizes, className, ref,
 *       disabled state, focus ring, clicks, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../../src/components/basics/Button.js";
import { buttonClasses } from "../../../src/components/basics/buttonStyles.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Button", () => {
  it("defaults to type=button so it never submits a surrounding form", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("keeps an explicit type", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("uses the accent background for the primary variant by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-h2", "rounded-full", "h-9", "px-4");
  });

  it("applies the secondary variant and the large size", () => {
    render(
      <Button variant="secondary" size="lg">
        Alt
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-b3", "h-11", "px-6");
    expect(button).not.toHaveClass("bg-h2", "h-9");
  });

  it("appends a caller className after the built-in classes", () => {
    render(<Button className="w-full">Wide</Button>);
    expect(screen.getByRole("button").className.endsWith(" w-full")).toBe(true);
  });

  it("lets a caller class replace a built-in one that sets the same property", () => {
    render(<Button className="h-11 px-8">Tall</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-11", "px-8");
    expect(button).not.toHaveClass("h-9", "px-4");
  });

  it("passes native props through and takes a ref as a plain prop", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} aria-label="Close" data-testid="close">
        x
      </Button>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Close" }));
    expect(ref.current).toHaveAttribute("data-testid", "close");
  });

  it("has a visible keyboard focus ring", () => {
    render(<Button>Focus</Button>);
    expect(screen.getByRole("button")).toHaveClass("focus-visible:outline-2");
  });

  it("calls onClick, and not when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Click
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps disabled buttons hoverable for the cursor and tooltips, without lighting up", () => {
    render(
      <Button disabled title="Not yet">
        Wait
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
    expect(button).not.toHaveClass("disabled:pointer-events-none");
    expect(button).toHaveClass("not-disabled:hover:bg-h1");
    expect(button).not.toHaveClass("hover:bg-h1");
  });

  it("has no axe violations in any variant", async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost" size="lg">
          Ghost
        </Button>
        <Button disabled>Disabled</Button>
      </div>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("buttonClasses", () => {
  it("defaults to a medium primary pill", () => {
    expect(buttonClasses()).toContain("bg-h2");
    expect(buttonClasses()).toContain("h-9");
  });

  it("builds the ghost variant with a caller className last", () => {
    const classes = buttonClasses({ variant: "ghost", className: "mt-2" });
    expect(classes).toContain("bg-transparent");
    expect(classes.endsWith(" mt-2")).toBe(true);
  });
});
