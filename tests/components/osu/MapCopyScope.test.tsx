/**
 * @file tests/components/osu/MapCopyScope.test.tsx
 * @desc MapCopyScope and MapCopyIdButton: inside a scope only the Copy ID pressed last keeps
 *       "Copied.", nested scopes share one rule, outside a scope each button keeps its own, a slow
 *       earlier copy never speaks after a newer press, the status sits before the button with
 *       its width kept, the class literal matches buttonClasses, and axe.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { buttonClasses } from "../../../src/components/basics/buttonStyles.js";
import { MAP_COPY_BUTTON, MapCopyIdButton } from "../../../src/components/osu/MapCopyIdButton.js";
import { MapCopyScope } from "../../../src/components/osu/MapCopyScope.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";
import { stubClipboard } from "../../helpers/clipboard.js";

let restore = () => {};
afterEach(() => restore());

const Copy = ({ id }: { id: number }) => (
  <MapCopyIdButton
    beatmapId={id}
    label="Copy ID"
    name={`Copy ID ${id}`}
    failedMessage={`Couldn't copy. The beatmap ID is ${id}.`}
  />
);

const statusOf = (id: number) =>
  screen.getByRole("button", { name: `Copy ID ${id}` }).parentElement?.querySelector("output");

describe("MapCopyScope", () => {
  it("keeps Copied. only on the button pressed last", async () => {
    const user = userEvent.setup();
    restore = stubClipboard().restore;
    render(
      <MapCopyScope>
        <Copy id={1} />
        <Copy id={2} />
      </MapCopyScope>,
    );
    await user.click(screen.getByRole("button", { name: "Copy ID 1" }));
    expect(statusOf(1)).toHaveTextContent("Copied.");
    await user.click(screen.getByRole("button", { name: "Copy ID 2" }));
    expect(statusOf(2)).toHaveTextContent("Copied.");
    expect(statusOf(1)).toBeEmptyDOMElement();
    await user.click(screen.getByRole("button", { name: "Copy ID 2" }));
    expect(statusOf(2)).toHaveTextContent("Copied.");
  });

  it("joins an outer scope from inside a nested one", async () => {
    const user = userEvent.setup();
    restore = stubClipboard().restore;
    render(
      <MapCopyScope>
        <Copy id={1} />
        <MapCopyScope>
          <Copy id={2} />
        </MapCopyScope>
      </MapCopyScope>,
    );
    await user.click(screen.getByRole("button", { name: "Copy ID 1" }));
    await user.click(screen.getByRole("button", { name: "Copy ID 2" }));
    expect(statusOf(1)).toBeEmptyDOMElement();
    expect(statusOf(2)).toHaveTextContent("Copied.");
  });

  it("leaves each button its own status outside any scope", async () => {
    const user = userEvent.setup();
    restore = stubClipboard().restore;
    render(
      <>
        <Copy id={1} />
        <Copy id={2} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Copy ID 1" }));
    await user.click(screen.getByRole("button", { name: "Copy ID 2" }));
    expect(statusOf(1)).toHaveTextContent("Copied.");
    expect(statusOf(2)).toHaveTextContent("Copied.");
  });

  it("never lets a slow earlier copy speak after a newer press", async () => {
    const user = userEvent.setup();
    const pending: (() => void)[] = [];
    const stub = stubClipboard((text) =>
      text === "1" ? new Promise<void>((resolve) => pending.push(resolve)) : Promise.resolve(),
    );
    restore = stub.restore;
    render(
      <MapCopyScope>
        <Copy id={1} />
        <Copy id={2} />
      </MapCopyScope>,
    );
    await user.click(screen.getByRole("button", { name: "Copy ID 1" }));
    await user.click(screen.getByRole("button", { name: "Copy ID 2" }));
    await act(async () => pending[0]?.());
    expect(statusOf(1)).toBeEmptyDOMElement();
    expect(statusOf(2)).toHaveTextContent("Copied.");
  });

  it("says the ID when the clipboard refuses", async () => {
    const user = userEvent.setup();
    restore = stubClipboard(() => Promise.reject(new Error("denied"))).restore;
    render(<Copy id={129891} />);
    await user.click(screen.getByRole("button", { name: "Copy ID 129891" }));
    expect(statusOf(129891)).toHaveTextContent("Couldn't copy. The beatmap ID is 129891.");
  });

  it("puts the status before the button with its width kept, in finished classes", () => {
    render(<Copy id={1} />);
    const button = screen.getByRole("button", { name: "Copy ID 1" });
    const output = statusOf(1) as HTMLElement;
    expect(button.compareDocumentPosition(output) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(output.className).toContain("min-w-[4.5rem]");
    expect(button).toHaveTextContent("Copy ID");
    expect(button.className).toBe(MAP_COPY_BUTTON);
    expect(MAP_COPY_BUTTON).toBe(
      buttonClasses({ variant: "secondary", className: "whitespace-nowrap" }),
    );
    expect(button.parentElement?.className).toContain("@2xl:flex-row");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <MapCopyScope>
        <Copy id={1} />
      </MapCopyScope>,
    );
    await expectNoAxeViolations(container);
  });
});
