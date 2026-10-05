/**
 * @file src/remark/estree.ts
 * @desc Appends `export const toc`, `readingMinutes` and `words` to an MDX tree as mdxjsEsm nodes.
 *       MDX compiles ESM from `node.data.estree`, not `value`, so the Program is built by hand
 *       (literals, arrays and plain objects only); `value` is filled too, for readable errors. An
 *       export the author already wrote wins and is not duplicated.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ArticleData } from "./articleData.js";
import type { MdNode } from "./mdast.js";

type EsNode = Record<string, unknown>;

const expression = (value: unknown): EsNode => {
  if (Array.isArray(value)) return { type: "ArrayExpression", elements: value.map(expression) };
  if (value !== null && typeof value === "object") {
    return {
      type: "ObjectExpression",
      properties: Object.entries(value).map(([key, item]) => ({
        type: "Property",
        key: { type: "Identifier", name: key },
        value: expression(item),
        kind: "init",
        method: false,
        shorthand: false,
        computed: false,
      })),
    };
  }
  return { type: "Literal", value, raw: JSON.stringify(value) };
};

const exportConst = (name: string, value: unknown): MdNode => ({
  type: "mdxjsEsm",
  value: `export const ${name} = ${JSON.stringify(value)};`,
  data: {
    estree: {
      type: "Program",
      sourceType: "module",
      body: [
        {
          type: "ExportNamedDeclaration",
          declaration: {
            type: "VariableDeclaration",
            kind: "const",
            declarations: [
              {
                type: "VariableDeclarator",
                id: { type: "Identifier", name },
                init: expression(value),
              },
            ],
          },
          specifiers: [],
          source: null,
          attributes: [],
        },
      ],
    },
  },
});

/**
 * @function appendMdxExports
 * @param tree {MdNode} an MDX document root
 * @param data {ArticleData} what to export
 * @returns {void} pushes one mdxjsEsm node per value the author hasn't exported already
 */
export function appendMdxExports(tree: MdNode, data: ArticleData): void {
  tree.children ??= [];
  const authored = tree.children
    .filter((node) => node.type === "mdxjsEsm")
    .map((node) => node.value ?? "");
  const values: [string, unknown][] = [
    ["toc", data.toc],
    ["readingMinutes", data.readingMinutes],
    ["words", data.words],
  ];
  for (const [name, value] of values) {
    const mine = new RegExp(`export\\s+const\\s+${name}\\b`);
    if (authored.some((source) => mine.test(source))) continue;
    tree.children.push(exportConst(name, value));
  }
}
