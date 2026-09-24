/**
 * @file tests/components/actions/CopyButton.test.tsx
 * @desc Component tests for CopyButton: clipboard success and failure, custom text, Button props,
 *       keyboard use, accessibility. The clipboard is always a stub.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyButton } from "../../../src/components/actions/CopyButton.js";
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

describe("CopyButton", () => {
  it("copies the text and says so in the status", async () => {
    const { user, writeText } = setup(() => Promise.resolve());
    render(<CopyButton text="12345" />);
    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();

    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(writeText).toHaveBeenCalledWith("12345");
    expect(status).toHaveTextContent("Copied.");
  });

  it("clears the status on each press, so a second copy is announced again", async () => {
    let finish = () => {};
    const { user } = setup(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<CopyButton text="12345" />);
    const status = screen.getByRole("status");
    const button = screen.getByRole("button", { name: "Copy" });

    await user.click(button);
    await act(async () => finish());
    expect(status).toHaveTextContent("Copied.");
    const first = status.firstChild;

    await user.click(button);
    expect(status).toBeEmptyDOMElement();
    await act(async () => finish());
    expect(status).toHaveTextContent("Copied.");
    // A fresh node, so the live region reports an addition even with the same text.
    expect(status.firstChild).not.toBe(first);
  });

  it("tells the reader to copy by hand when the clipboard refuses", async () => {
    const { user } = setup(() => Promise.reject(new Error("denied")));
    render(<CopyButton text="12345" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Couldn't copy. Select the text and copy it by hand.",
    );
  });

  it("fails politely when there is no clipboard at all (insecure context)", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    render(<CopyButton text="12345" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy.");
  });

  it("uses a custom label and custom messages", async () => {
    const { user } = setup(() => Promise.resolve());
    const { rerender } = render(
      <CopyButton
        text="magnet:?xt=1"
        label="Copy magnet link"
        copiedMessage="Magnet link copied."
        failedMessage="No luck."
      />,
    );
    await user.click(screen.getByRole("button", { name: "Copy magnet link" }));
    expect(screen.getByRole("status")).toHaveTextContent("Magnet link copied.");

    setup(() => Promise.reject(new Error("denied")));
    rerender(
      <CopyButton
        text="magnet:?xt=1"
        label="Copy magnet link"
        copiedMessage="Magnet link copied."
        failedMessage="No luck."
      />,
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("No luck.");
  });

  it("copies from the keyboard with Enter and Space", async () => {
    const { user, writeText } = setup(() => Promise.resolve());
    render(<CopyButton text="abc" />);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(writeText).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("status")).toHaveTextContent("Copied.");
  });

  it("is a secondary button by default and passes the variant through", () => {
    const { rerender } = render(<CopyButton text="x" />);
    expect(screen.getByRole("button")).toHaveClass("bg-b3");
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");

    rerender(<CopyButton text="x" variant="primary" size="lg" />);
    expect(screen.getByRole("button")).toHaveClass("bg-h2", "h-11");
    expect(screen.getByRole("button")).not.toHaveClass("bg-b3");
  });

  it("puts className on the button and wrapperClassName on the wrapper, both last", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <CopyButton
        ref={ref}
        text="x"
        className="w-full"
        wrapperClassName="mt-4"
        aria-describedby="hint"
        data-testid="copy"
      />,
    );
    const button = screen.getByRole("button");
    expect(ref.current).toBe(button);
    expect(button.className.endsWith(" w-full")).toBe(true);
    expect(button).toHaveAttribute("aria-describedby", "hint");
    expect(button).toHaveAttribute("data-testid", "copy");
    const wrapper = button.parentElement as HTMLElement;
    expect(wrapper).toHaveClass("flex", "flex-wrap", "items-center", "gap-3");
    expect(wrapper.className.endsWith(" mt-4")).toBe(true);
  });

  it("does nothing while disabled", async () => {
    const { user, writeText } = setup(() => Promise.resolve());
    render(<CopyButton text="x" disabled />);
    await user.click(screen.getByRole("button"));
    expect(writeText).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("styles the status like the packs export status", () => {
    render(<CopyButton text="x" />);
    expect(screen.getByRole("status")).toHaveClass("text-c3", "text-sm");
  });

  it("has no axe violations before and after copying", async () => {
    const { user } = setup(() => Promise.resolve());
    const { container } = render(<CopyButton text="x" />);
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("status")).toHaveTextContent("Copied.");
    await expectNoAxeViolations(container);
  });
});
