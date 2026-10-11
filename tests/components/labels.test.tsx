/**
 * @file tests/components/labels.test.tsx
 * @desc The 0.26 label props outside the palette: CodeBlock's labels, the heading anchor's
 *       name, SortableMoveButtons' names, ContentNav's summary, ContentPage's labels and locale,
 *       ContentSearch's count line, MapGroup's count, BrandPage's headings and the content date
 *       in other locales. Each default stays English.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 11, 2026
 * @modified Sun Oct 11, 2026
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SectionHeading } from "../../src/components/basics/SectionHeading.js";
import { BrandPage } from "../../src/components/brand/BrandPage.js";
import { ContentNav } from "../../src/components/content/ContentNav.js";
import { ContentPage } from "../../src/components/content/ContentPage.js";
import { ContentSearch } from "../../src/components/content/ContentSearch.js";
import { formatContentDate } from "../../src/components/content/contentDate.js";
import { CodeBlock } from "../../src/components/mdx/CodeBlock.js";
import { MapGroup } from "../../src/components/osu/MapGroup.js";
import { SortableMoveButtons } from "../../src/components/sortable/SortableMoveButtons.js";
import { useSortable } from "../../src/components/sortable/useSortable.js";

describe("CodeBlock labels", () => {
  it("names the header, button and scroll box from labels", async () => {
    render(
      await CodeBlock({
        code: "x",
        labels: {
          code: "コード",
          copy: "コピー",
          copyName: (t) => (t ? `${t}をコピー` : "コードをコピー"),
        },
      }),
    );
    expect(screen.getByRole("button", { name: "コードをコピー" })).toHaveTextContent("コピー");
    expect(screen.getByRole("group", { name: "コード" })).toBeInTheDocument();
    render(
      await CodeBlock({ code: "y", title: "a.ts", labels: { codeName: (n) => `コード: ${n}` } }),
    );
    expect(screen.getByRole("group", { name: "コード: a.ts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy a.ts" })).toBeInTheDocument();
  });
});

describe("SectionHeading anchorLabel", () => {
  it("names the anchor, English by default", () => {
    render(
      <>
        <SectionHeading anchor id="a">
          Alpha
        </SectionHeading>
        <SectionHeading anchor id="b" anchorLabel={(t) => `${t}へのリンク`}>
          Beta
        </SectionHeading>
      </>,
    );
    expect(screen.getByRole("link", { name: "Link to section: Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Betaへのリンク" })).toBeInTheDocument();
  });
});

function Moves() {
  const sortable = useSortable({ onMove: () => true });
  return (
    <ol {...sortable.container("l", { label: "List" })}>
      <li {...sortable.item("x", { container: "l", index: 0, label: "x" })}>
        <SortableMoveButtons
          sortable={sortable}
          id="x"
          label="x"
          upLabel={(l) => `${l}を上へ`}
          downLabel={(l) => `${l}を下へ`}
        />
      </li>
    </ol>
  );
}

describe("SortableMoveButtons names", () => {
  it("takes upLabel and downLabel", () => {
    render(<Moves />);
    expect(screen.getByRole("button", { name: "xを上へ" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "xを下へ" })).toBeInTheDocument();
  });
});

describe("ContentNav summaryLabel", () => {
  it("labels the phone disclosure", () => {
    const { container } = render(
      <ContentNav label="Docs" indexHref="/docs" groups={[]} summaryLabel="目次" />,
    );
    expect(container.querySelector("summary")).toHaveTextContent("目次");
  });
});

describe("ContentPage labels and locale", () => {
  it("writes the meta row in the given words and dates", () => {
    render(
      <ContentPage
        title="T"
        authors={[{ name: "A" }, { name: "B" }]}
        published="2026-10-04"
        lastUpdated="2026-10-05"
        readingMinutes={3}
        markdownHref="/t.md"
        locale="ja"
        labels={{
          updated: "更新",
          readingTime: (n) => `${n}分`,
          and: "と",
          copyMarkdown: "Markdownをコピー",
        }}
      >
        body
      </ContentPage>,
    );
    expect(document.body).toHaveTextContent("AとB");
    expect(document.body).toHaveTextContent("3分");
    expect(document.body).toHaveTextContent("更新 2026/10/05");
    expect(screen.getByRole("button", { name: "Markdownをコピー" })).toBeInTheDocument();
  });
});

describe("ContentSearch countText", () => {
  it("writes the whole count line", async () => {
    const user = userEvent.setup();
    const items = [{ href: "/a", title: "Alpha", description: "" }];
    render(
      <ContentSearch
        items={items}
        label="Search"
        countText={(total, matches) => (matches === null ? `全${total}件` : `${matches}件一致`)}
      />,
    );
    expect(document.body).toHaveTextContent("全1件");
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(document.body).toHaveTextContent("0件一致");
  });
});

describe("MapGroup countText", () => {
  it("formats the count", () => {
    render(<MapGroup title="NM" count={2} target={4} countText={(c, t) => `${c}/${t}`} />);
    expect(screen.getByRole("heading")).toHaveTextContent("2/4");
  });
});

describe("BrandPage labels", () => {
  it("renames headings and the osu! line", () => {
    render(
      <BrandPage
        name="x"
        mark="x"
        tagline=""
        url="https://x"
        writing=""
        dos={[]}
        donts={[]}
        palette={{}}
        assets={[]}
        contact="a@b"
        familyHref={null}
        labels={{ name: "名前", osuNotice: "非公式" }}
      />,
    );
    expect(screen.getByRole("heading", { name: "名前" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Logo" })).toBeInTheDocument();
    expect(document.body).toHaveTextContent("非公式");
  });
});

describe("formatContentDate locale", () => {
  it("formats in the given locale, English by default", () => {
    expect(formatContentDate("2026-10-04")).toBe("Oct 4, 2026");
    expect(formatContentDate("2026-10-04", "ja")).toBe("2026/10/04");
    expect(formatContentDate("2026-10-04", "ja")).toBe("2026/10/04");
  });
});
