/**
 * @file tests/components/mdx/CodeCopyButton.test.tsx
 * @desc Component tests for CodeCopyButton: clipboard success and failure, missing clipboard, a
 *       second press re-announcing, the visible "Copy" text against the label's accessible name,
 *       and accessibility. The clipboard is always a stub, as in CopyButton.test.tsx.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeCopyButton } from "../../../src/components/mdx/CodeCopyButton.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

let original: PropertyDescriptor | undefined;

beforeEach(() => {
  original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
});

afterEach(() => {
  if (original) Object.defineProperty(navigator, "clipboard", original);
  else Reflect.deleteProperty(navigator, "clipboard");
  vi.restoreAllMocks();
});

/** Sets up user-event, then swaps in a clipboard whose writeText does what the test says. */
const setup = (writeText: (text: string) => Promise<void>) => {
  const user = userEvent.setup();
  const spy = vi.fn(writeText);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: spy },
  });
  return { user, writeText: spy };
};

describe("CodeCopyButton", () => {
  it("copies the code and says so in the status", async () => {
    const { user, writeText } = setup(() => Promise.resolve());
    render(<CodeCopyButton code="12345" label="Copy code" />);
    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();

    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenCalledWith("12345");
    expect(status).toHaveTextContent("Copied");
  });

  it("reports a failure when the clipboard refuses", async () => {
    const { user } = setup(() => Promise.reject(new Error("denied")));
    render(<CodeCopyButton code="12345" label="Copy code" />);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("status")).toHaveTextContent("Copy failed");
  });

  it("reports a failure when there is no clipboard at all", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    render(<CodeCopyButton code="12345" label="Copy code" />);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("status")).toHaveTextContent("Copy failed");
  });

  it("clears the status on each press, so a second copy is announced again", async () => {
    let finish = () => {};
    const { user } = setup(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<CodeCopyButton code="12345" label="Copy code" />);
    const status = screen.getByRole("status");
    const button = screen.getByRole("button", { name: "Copy code" });

    await user.click(button);
    await act(async () => finish());
    expect(status).toHaveTextContent("Copied");
    const first = status.firstChild;

    await user.click(button);
    expect(status).toBeEmptyDOMElement();
    await act(async () => finish());
    expect(status).toHaveTextContent("Copied");
    expect(status.firstChild).not.toBe(first);
  });

  it("shows visible text 'Copy' with the accessible name taken from the label", () => {
    render(<CodeCopyButton code="x" label="Copy x.ts" />);
    const button = screen.getByRole("button", { name: "Copy x.ts" });
    expect(button).toHaveTextContent("Copy");
    expect(button).not.toHaveTextContent("Copy x.ts");
  });

  it("has no axe violations before and after copying", async () => {
    const { user } = setup(() => Promise.resolve());
    const { container } = render(<CodeCopyButton code="x" label="Copy code" />);
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    await expectNoAxeViolations(container);
  });
});
