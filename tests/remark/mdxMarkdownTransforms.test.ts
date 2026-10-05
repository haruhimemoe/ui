/**
 * @file tests/remark/mdxMarkdownTransforms.test.ts
 * @desc Figure, Embed and MdxLinkCard become Markdown lines for the .md mirrors; text around
 *       them, fenced code and tags missing a required prop are untouched.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { describe, expect, it } from "vitest";
import { mdxMarkdownTransforms } from "../../src/remark/mdxMarkdownTransforms.js";

const apply = (source: string) =>
  mdxMarkdownTransforms.reduce((text, transform) => transform(text), source);

describe("mdxMarkdownTransforms", () => {
  it("turns a Figure into an image with its caption as the title", () => {
    expect(
      apply(
        `Before\n\n<Figure src="/a.png" alt="Lobby [1]" width={640} height={360} caption='Say "hi"' />\n\nAfter`,
      ),
    ).toBe('Before\n\n![Lobby \\[1\\]](/a.png "Say \\"hi\\"")\n\nAfter');
  });

  it("turns a multi-line Figure without a caption into a plain image", () => {
    expect(apply('<Figure\n  src="/a.png"\n  alt="Lobby"\n  width={640}\n  height={360}\n/>')).toBe(
      "![Lobby](/a.png)",
    );
  });

  it("drops a JSX caption it can't read", () => {
    expect(apply('<Figure src="/a.png" alt="A" width={1} height={1} caption={<b>x</b>} />')).toBe(
      "![A](/a.png)",
    );
  });

  it("turns an Embed into its URL and a link card into a link line", () => {
    expect(apply('<Embed url="https://youtu.be/dQw4w9WgXcQ" title="Finals" />')).toBe(
      "https://youtu.be/dQw4w9WgXcQ",
    );
    expect(
      apply(
        '<MdxLinkCard href="https://osu.ppy.sh/wiki" title="osu! wiki" description="Rules and mods" />',
      ),
    ).toBe("[osu! wiki](https://osu.ppy.sh/wiki): Rules and mods");
    expect(apply("<MdxLinkCard href='/guides/seeding' title='Seeding' />")).toBe(
      "[Seeding](/guides/seeding)",
    );
  });

  it("leaves a tag missing a required prop alone", () => {
    expect(apply('<Figure alt="A" />')).toBe('<Figure alt="A" />');
    expect(apply("<Embed />")).toBe("<Embed />");
  });

  it("leaves fenced code byte for byte", () => {
    const fence =
      '```mdx\n<Figure src="/a.png" alt="A" />\n<Embed url="https://youtu.be/dQw4w9WgXcQ" />\n```';
    const tilde = '~~~~\n<MdxLinkCard href="/x" title="X" />\n```\nstill code\n~~~~';
    expect(apply(`${fence}\n\n${tilde}\n`)).toBe(`${fence}\n\n${tilde}\n`);
  });
});
