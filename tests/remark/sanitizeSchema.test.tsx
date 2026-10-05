/**
 * @file tests/remark/sanitizeSchema.test.tsx
 * @desc react-markdown + rehype-sanitize with haruhimeSanitizeSchema and rehypeLocalHrefs: the
 *       base schema is never mutated, footnote and heading links match their prefixed ids, raw
 *       HTML ids can't clobber globals, figure/embed/h4 survive, and trusted drops the prefix.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render } from "@testing-library/react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";
import remarkHaruhime, {
  haruhimeSanitizeSchema,
  rehypeLocalHrefs,
} from "../../src/remark/index.js";

const md = (source: string, trusted = false) =>
  render(
    <Markdown
      remarkPlugins={[remarkGfm, remarkHaruhime]}
      remarkRehypeOptions={trusted ? undefined : { clobberPrefix: "" }}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, haruhimeSanitizeSchema(defaultSchema, { trusted })],
        rehypeLocalHrefs,
      ]}
    >
      {source}
    </Markdown>,
  ).container;

describe("haruhimeSanitizeSchema", () => {
  it("never mutates the base schema", () => {
    const tags = [...(defaultSchema.tagNames ?? [])];
    const h2 = [...(defaultSchema.attributes?.h2 ?? [])];
    haruhimeSanitizeSchema(defaultSchema, { trusted: true });
    expect(defaultSchema.tagNames).toEqual(tags);
    expect(defaultSchema.attributes?.h2).toEqual(h2);
    expect(defaultSchema.clobberPrefix).toBe("user-content-");
  });

  it("keeps the prefix by default and drops it when trusted", () => {
    expect(haruhimeSanitizeSchema(defaultSchema).clobberPrefix).toBe("user-content-");
    expect(haruhimeSanitizeSchema(defaultSchema, { trusted: true }).clobberPrefix).toBe("");
  });

  it("links each footnote to an id that exists, prefixed once", () => {
    const root = md("Seeding rules[^1].\n\n[^1]: Ties go to the higher qualifier score.");
    const ref = root.querySelector("a[data-footnote-ref]");
    expect(ref).toHaveAttribute("href", "#user-content-fn-1");
    expect(root.querySelector("#user-content-fn-1")).not.toBeNull();
    const back = root.querySelector("a[data-footnote-backref]");
    expect(root.querySelector(back?.getAttribute("href") ?? "#none")).not.toBeNull();
    expect(root.querySelector("#user-content-user-content-fn-1")).toBeNull();
  });

  it("rewrites an in-page heading link to the prefixed id, non-ASCII included", () => {
    const root = md("## Usage\n\n## 日本語\n\n[jump](#usage) [ja](#日本語)");
    expect(root.querySelector("h2#user-content-usage")).not.toBeNull();
    const links = [...root.querySelectorAll("p a")].map((a) => a.getAttribute("href"));
    expect(links[0]).toBe("#user-content-usage");
    expect(decodeURIComponent(links[1] ?? "")).toBe("#user-content-日本語");
  });

  it("prefixes raw HTML ids and names so they can't clobber globals, and leaves dead links", () => {
    const root = md(
      '<a id="location">x</a> <img name="getElementById" src="/a.png" alt="">\n\n[gone](#nothing-here)',
    );
    expect(root.querySelector("#location")).toBeNull();
    expect(root.querySelector("#user-content-location")).not.toBeNull();
    expect(root.querySelector("img")?.getAttribute("name")).toBe("user-content-getElementById");
    expect(root.querySelector('a[href="#nothing-here"]')).not.toBeNull();
  });

  it("keeps figures, figcaptions, embed divs, h4 ids and picture sources", () => {
    const root = md(
      '#### Rolls\n\n![Lobby](/a.png "Qualifier lobby")\n\nhttps://youtu.be/dQw4w9WgXcQ\n\n<picture><source srcset="/b.png" media="(min-width: 1px)"><img src="/b.png" alt="B"></picture>',
    );
    expect(root.querySelector("h4#user-content-rolls")).not.toBeNull();
    expect(root.querySelector("figure figcaption")?.textContent).toBe("Qualifier lobby");
    expect(root.querySelector("div[data-embed]")).toHaveAttribute(
      "data-embed",
      "https://youtu.be/dQw4w9WgXcQ",
    );
    expect(root.querySelector("source")).toHaveAttribute("media", "(min-width: 1px)");
  });

  it("keeps bare ids when trusted", () => {
    const root = md("## Usage\n\n[jump](#usage)", true);
    expect(root.querySelector("h2#usage")).not.toBeNull();
    expect(root.querySelector('a[href="#usage"]')).not.toBeNull();
  });
});
