/**
 * @file tests/components/forms/LocaleSelect.test.tsx
 * @desc LocaleSelect: nothing with one locale, endonyms as option names, the NEXT_LOCALE cookie
 *       (with the domain when given), onChange, then a refresh. localeName's fallbacks.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 11, 2026
 * @modified Sun Oct 11, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LocaleSelect,
  localeName,
  writeLocaleCookie,
} from "../../../src/components/forms/LocaleSelect.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation.js", () => ({ useRouter: () => ({ refresh }) }));

afterEach(() => {
  refresh.mockClear();
  // biome-ignore lint/suspicious/noDocumentCookie: test cleanup
  document.cookie = "NEXT_LOCALE=; max-age=0; path=/";
});

describe("LocaleSelect", () => {
  it("renders nothing for one locale", () => {
    const { container } = render(<LocaleSelect locales={["en"]} value="en" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("names each locale in itself, writes the cookie, calls onChange and refreshes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <LocaleSelect locales={["en", "ja"]} value="en" label="言語" onChange={onChange} />,
    );
    const select = screen.getByRole("combobox", { name: "言語" });
    expect(screen.getByRole("option", { name: "日本語" })).toHaveAttribute("lang", "ja");
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
    await user.selectOptions(select, "ja");
    expect(document.cookie).toContain("NEXT_LOCALE=ja");
    expect(onChange).toHaveBeenCalledWith("ja");
    expect(refresh).toHaveBeenCalledOnce();
    await expectNoAxeViolations(container);
  });
});

describe("localeName and writeLocaleCookie", () => {
  it("falls back to the tag", () => {
    expect(localeName("en")).toBe("English");
    expect(localeName("not a tag")).toBe("not a tag");
  });

  it("adds the domain and secure when asked", () => {
    const set = vi.spyOn(document, "cookie", "set");
    writeLocaleCookie("ko", ".haruhime.moe");
    expect(set).toHaveBeenCalledWith(expect.stringContaining("domain=.haruhime.moe"));
    set.mockRestore();
  });
});
