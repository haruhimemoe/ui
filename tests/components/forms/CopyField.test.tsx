/**
 * @file tests/components/forms/CopyField.test.tsx
 * @desc Component tests for CopyField: readonly mono field that selects on focus, copying and
 *       announcing, description by label not value, ref and actions, mono toggle and hint,
 *       clipboard failures, accessibility. Clipboard stubbing as in CopyButton.test.tsx.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyField } from "../../../src/components/forms/CopyField.js";
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
const clipboard = (writeText: (text: string) => Promise<void>) => {
  const spy = vi.fn(writeText);
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: spy } });
  return spy;
};

describe("CopyField", () => {
  it("is a read-only mono field whose focus selects the whole value, after the caller's onFocus", async () => {
    const user = userEvent.setup();
    const order: string[] = [];
    render(
      <CopyField
        label="Pack key"
        value="PACKKEY123"
        onFocus={(event) => order.push(`caller:${event.currentTarget.selectionEnd}`)}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Pack key" }) as HTMLInputElement;
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveClass("font-mono");
    await user.click(input);
    expect(order).toHaveLength(1);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("PACKKEY123".length);
  });

  it("copies the value and says so", async () => {
    const user = userEvent.setup();
    const writeText = clipboard(() => Promise.resolve());
    render(
      <CopyField
        label="Pack key"
        value="PACKKEY123"
        copyLabel="Copy key"
        copiedMessage="Key copied."
      />,
    );
    await user.click(screen.getByRole("button", { name: "Copy key" }));
    expect(writeText).toHaveBeenCalledWith("PACKKEY123");
    expect(screen.getByRole("status")).toHaveTextContent("Key copied.");
  });

  it("describes the copy button by the field's label, not its value", () => {
    render(<CopyField label="Pack key" value="SECRET" />);
    expect(screen.getByRole("button", { name: "Copy" })).toHaveAccessibleDescription("Pack key");
  });

  it("reaches the input with ref and renders actions in the copy row", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <CopyField
        ref={ref}
        label="Magnet link"
        value="magnet:?xt=urn:btih:abc"
        actions={<button type="button">Add magnet link</button>}
      />,
    );
    expect(ref.current).toBe(screen.getByRole("textbox", { name: "Magnet link" }));
    const copy = screen.getByRole("button", { name: "Copy" });
    const add = screen.getByRole("button", { name: "Add magnet link" });
    expect(copy.closest("div.flex-wrap")?.parentElement).toBe(add.parentElement);
  });

  it("drops font-mono with mono={false} and passes hint", () => {
    render(
      <CopyField
        label="Link"
        value="https://x"
        mono={false}
        hint="Anyone with it can open the pack."
      />,
    );
    const input = screen.getByRole("textbox", { name: "Link" });
    expect(input).not.toHaveClass("font-mono");
    expect(input).toHaveAccessibleDescription("Anyone with it can open the pack.");
  });

  // Review Focus 4.
  it("reports a refused or missing clipboard and still lets the user select by hand", async () => {
    const user = userEvent.setup();
    clipboard(() => Promise.reject(new Error("denied")));
    render(<CopyField label="API key" value="hk_abc" />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Couldn't copy. Select the text and copy it by hand.",
    );
    Reflect.deleteProperty(navigator, "clipboard");
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByRole("status")).toHaveTextContent("Couldn't copy.");
    const input = screen.getByRole("textbox", { name: "API key" }) as HTMLInputElement;
    await user.click(input);
    expect(input.selectionEnd).toBe("hk_abc".length);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <CopyField label="Short link" value="https://packs.haruhime.moe/p/x" />,
    );
    await expectNoAxeViolations(container);
  });
});
