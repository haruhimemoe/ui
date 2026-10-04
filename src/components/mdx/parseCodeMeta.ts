/**
 * @file src/components/mdx/parseCodeMeta.ts
 * @desc Parses a fenced code block's meta string (the text after the language on ```ts fences)
 *       into a title (`title="..."` or `title='...'`) and a sorted, deduped list of highlighted
 *       line numbers (`{1,3-5}`), capped at 10000 lines so a huge or malicious range can't hang
 *       the render.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sat Oct 3, 2026
 * @modified Sat Oct 3, 2026
 */

/** A parsed code fence meta string. */
export type CodeMeta = { title?: string; highlight: number[] };

const TITLE = /\btitle=(?:"([^"]*)"|'([^']*)')/;
const RANGES = /\{([^}]*)\}/;
const MAX_LINES = 10000;

/**
 * @function parseCodeMeta
 * @param meta {string | null | undefined} the code fence's meta string, if any
 * @returns {CodeMeta} the title (when present) and the sorted, deduped, capped highlight lines
 */
export const parseCodeMeta = (meta?: string | null): CodeMeta => {
  const text = meta ?? "";
  const lines = new Set<number>();
  for (const part of RANGES.exec(text)?.[1]?.split(",") ?? []) {
    const match = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(part);
    if (!match) continue;
    let from = Number(match[1]);
    let to = match[2] === undefined ? from : Number(match[2]);
    if (from > to) [from, to] = [to, from];
    from = Math.max(from, 1);
    for (let line = from; line <= to && lines.size < MAX_LINES; line++) lines.add(line);
  }
  const title = TITLE.exec(text);
  const result: CodeMeta = { highlight: [...lines].sort((a, b) => a - b) };
  const name = title?.[1] ?? title?.[2];
  if (name) result.title = name;
  return result;
};
