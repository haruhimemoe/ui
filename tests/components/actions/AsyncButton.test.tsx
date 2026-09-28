/**
 * @file tests/components/actions/AsyncButton.test.tsx
 * @desc Component tests for AsyncButton: the result in a live output, the pending label, one run
 *       at a time, failures in rose (a message or a function of the error), keyboard,
 *       accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AsyncButton } from "../../../src/components/actions/AsyncButton.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("AsyncButton", () => {
  it("runs the action from the keyboard and announces what it returns", async () => {
    const user = userEvent.setup();
    render(<AsyncButton action={async () => "Done."}>Refresh pages</AsyncButton>);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent("Done.");
  });

  it("shows the pending label, ignores presses while running, and keeps focus", async () => {
    const user = userEvent.setup();
    let finish = (_: string) => {};
    const action = vi.fn(() => new Promise<string>((resolve) => (finish = resolve)));
    render(
      <AsyncButton action={action} pendingLabel="Refreshing…">
        Refresh
      </AsyncButton>,
    );
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    const button = screen.getByRole("button", { name: "Refreshing…" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveFocus();
    await user.click(button);
    expect(action).toHaveBeenCalledTimes(1);
    await act(async () => finish("Rebuilt."));
    expect(screen.getByRole("button", { name: "Refresh" })).not.toHaveAttribute("aria-disabled");
    expect(screen.getByRole("status")).toHaveTextContent("Rebuilt.");
  });

  it("shows a failure in rose, from a message or a function of the error", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AsyncButton action={() => Promise.reject(new Error("503"))}>Retry</AsyncButton>,
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Something went wrong. Try again.")).toHaveClass("text-rose-300");
    rerender(
      <AsyncButton
        action={() => {
          throw new Error("503");
        }}
        failedMessage={(error) => `Failed: ${(error as Error).message}.`}
      >
        Retry
      </AsyncButton>,
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Failed: 503.");
  });

  it("takes Button props and wrapper classes, and has no axe violations", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AsyncButton action={() => "Ok."} variant="ghost" wrapperClassName="mt-2" className="w-full">
        Go
      </AsyncButton>,
    );
    const button = screen.getByRole("button", { name: "Go" });
    expect(button).toHaveClass("bg-transparent", "w-full");
    expect(button.parentElement).toHaveClass("mt-2");
    await user.click(button);
    await expectNoAxeViolations(container);
  });
});
