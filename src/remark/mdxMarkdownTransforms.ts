/**
 * @file src/remark/mdxMarkdownTransforms.ts
 * @desc String transforms for next-kit's mdxToMarkdown `transforms` option: props-only MDX
 *       components that would vanish from .md mirrors become Markdown. `<Figure src alt caption />`
 *       becomes an image, `<Embed url />` its URL, `<MdxLinkCard href title description />` a link
 *       line. Fenced code is skipped (next-kit runs transforms before its own fence split). Only
 *       string-valued props are read; a tag missing a required prop is left for next-kit to drop.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

const OPEN = /^ {0,3}(`{3,}|~{3,})/;
const ATTR = /([\w-]+)=(?:"([^"]*)"|'([^']*)'|\{"([^"]*)"\}|\{'([^']*)'\})/g;
const tag = (name: string) =>
  new RegExp(
    `<${name}\\b((?:\\s+[\\w-]+(?:=(?:"[^"]*"|'[^']*'|\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}))?)*)\\s*\\/>`,
    "g",
  );

const attributes = (body: string): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const match of body.matchAll(ATTR)) {
    out[match[1] as string] = match[2] ?? match[3] ?? match[4] ?? match[5] ?? "";
  }
  return out;
};

/** Runs `replace` over the text outside fenced code blocks only. */
const outsideFences = (source: string, replace: (text: string) => string): string => {
  const out: string[] = [];
  let prose: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    if (prose.length > 0) out.push(replace(prose.join("\n")));
    prose = [];
  };
  for (const line of source.split("\n")) {
    const open = OPEN.exec(line)?.[1];
    if (fence !== null) {
      out.push(line);
      if (open && open[0] === fence[0] && open.length >= fence.length && line.trim() === open)
        fence = null;
    } else if (open) {
      flush();
      fence = open;
      out.push(line);
    } else {
      prose.push(line);
    }
  }
  flush();
  return out.join("\n");
};

const transform =
  (name: string, build: (props: Record<string, string>) => string | null) =>
  (source: string): string =>
    outsideFences(source, (text) =>
      text.replace(tag(name), (whole, body: string) => build(attributes(body)) ?? whole),
    );

const escapeAlt = (text: string) => text.replace(/[[\]]/g, "\\$&");

/**
 * @function figureMarkdown
 * @param source {string} raw MDX
 * @returns {string} the source with each `<Figure ... />` as `![alt](src "caption")`
 */
export const figureMarkdown = transform("Figure", ({ src, alt, caption }) =>
  src && alt !== undefined
    ? `![${escapeAlt(alt)}](${src}${caption ? ` "${caption.replace(/"/g, '\\"')}"` : ""})`
    : null,
);

/**
 * @function embedMarkdown
 * @param source {string} raw MDX
 * @returns {string} the source with each `<Embed url="..." />` as its URL
 */
export const embedMarkdown = transform("Embed", ({ url }) => url || null);

/**
 * @function linkCardMarkdown
 * @param source {string} raw MDX
 * @returns {string} the source with each `<MdxLinkCard ... />` as `[title](href): description`
 */
export const linkCardMarkdown = transform("MdxLinkCard", ({ href, title, description }) =>
  href && title ? `[${title}](${href})${description ? `: ${description}` : ""}` : null,
);

/** The three transforms, in next-kit's `transforms` shape. */
export const mdxMarkdownTransforms: readonly ((source: string) => string)[] = [
  figureMarkdown,
  embedMarkdown,
  linkCardMarkdown,
];
