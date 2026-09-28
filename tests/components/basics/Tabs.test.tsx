/**
 * @file tests/components/basics/Tabs.test.tsx
 * @desc Component tests for Tabs and its ids: roles and ids, the chosen tab in the Tab order,
 *       clicks, Left and Right wrapping, Home and End, other keys, no tab chosen, accessibility.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Sep 28, 2026
 * @modified Mon Sep 28, 2026
 */

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "../../../src/components/basics/Tabs.js";
import { tabId, tabPanelId } from "../../../src/components/basics/tabIds.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const TABS = [
  { id: "write", label: "Write" },
  { id: "preview", label: "Preview" },
  { id: "both", label: "Both" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function Harness({ start = "write" as Tab, onChange = (_: Tab) => {} }) {
  const [value, setValue] = useState<Tab>(start);
  return (
    <>
      <Tabs
        label="Editor view"
        idPrefix="ed"
        tabs={TABS}
        value={value}
        onChange={(id) => {
          setValue(id);
          onChange(id);
        }}
      />
      {TABS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={tabPanelId("ed", tab.id)}
          aria-labelledby={tabId("ed", tab.id)}
          hidden={tab.id !== value}
        >
          {tab.label} panel
        </div>
      ))}
    </>
  );
}

describe("Tabs", () => {
  it("builds the ids from the prefix", () => {
    expect(tabId("ed", "write")).toBe("ed-tab-write");
    expect(tabPanelId("ed", "write")).toBe("ed-panel-write");
  });

  it("is a named tablist whose chosen tab is selected, controls its panel and has focus order", async () => {
    const { container } = render(<Harness />);
    expect(screen.getByRole("tablist", { name: "Editor view" })).toHaveClass("bg-b4");
    const write = screen.getByRole("tab", { name: "Write" });
    expect(write).toHaveAttribute("aria-selected", "true");
    expect(write).toHaveAttribute("aria-controls", "ed-panel-write");
    expect(write).toHaveAttribute("tabindex", "0");
    expect(write).toHaveClass("bg-h2", "text-c1");
    expect(screen.getByRole("tab", { name: "Preview" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel", { name: "Write" })).toHaveTextContent("Write panel");
    await expectNoAxeViolations(container);
  });

  it("picks a tab on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: "Both" }));
    expect(onChange).toHaveBeenCalledWith("both");
    expect(screen.getByRole("tab", { name: "Both" })).toHaveAttribute("aria-selected", "true");
  });

  it("moves with the arrows (wrapping), Home and End, and focuses the tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Write" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Both" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Write" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Both" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Write" })).toHaveAttribute("aria-selected", "true");
  });

  it("ignores other keys and passes onKeyDown through", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Tabs
        label="View"
        idPrefix="v"
        tabs={TABS}
        value="preview"
        onChange={onChange}
        onKeyDown={onKeyDown}
      />,
    );
    await user.tab();
    await user.keyboard("a");
    expect(onKeyDown).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the first tab reachable when none is chosen, and handles no tabs", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <Tabs label="View" idPrefix="v" tabs={TABS} value={"none" as Tab} onChange={onChange} />,
    );
    expect(screen.getByRole("tab", { name: "Write" })).toHaveAttribute("tabindex", "0");
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("preview");
    rerender(<Tabs label="View" idPrefix="v" tabs={[]} value="x" onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
