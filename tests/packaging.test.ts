/**
 * @file tests/packaging.test.ts
 * @desc Checks on the source files as they ship: Next subpath imports carry ".js" (next has no
 *       exports map, so Node ESM and Vitest in a consuming app need the file name), and every
 *       file that uses client hooks starts with "use client".
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.join(import.meta.dirname, "..");
const src = path.join(root, "src");

const sources = readdirSync(src, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
  .map((entry) => {
    const file = path.join(entry.parentPath, entry.name);
    return { name: path.relative(root, file), text: readFileSync(file, "utf8") };
  });

/** The first statement after the file's header comment. */
const firstStatement = (text: string): string =>
  text
    .replace(/^\s*\/\*[\s\S]*?\*\/\s*/, "")
    .split("\n")[0]
    ?.trim() ?? "";

describe("shipped source", () => {
  it("finds the source files", () => {
    expect(sources.length).toBeGreaterThan(20);
  });

  it("imports next subpaths by file name (next/link.js), which Node ESM can resolve", () => {
    const bare = sources.flatMap(({ name, text }) =>
      [...text.matchAll(/from "(next\/[^"]+)"/g)]
        .map((match) => match[1] as string)
        .filter((specifier) => !specifier.endsWith(".js"))
        .map((specifier) => `${name}: ${specifier}`),
    );
    expect(bare).toEqual([]);
  });

  it('starts every file that uses client hooks or browser APIs with "use client"', () => {
    const code = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    const client = sources.filter(({ text }) =>
      /\b(useState|useEffect|useLayoutEffect|useRef|usePathname|useRouter|navigator\.|document\.|window\.)/.test(
        code(text),
      ),
    );
    expect(client.map(({ name }) => name).sort()).toEqual([
      "src/components/actions/CopyButton.tsx",
      "src/components/actions/PaginationStatus.tsx",
      "src/components/filters/FilterPanel.tsx",
      "src/components/filters/RangeSlider.tsx",
      "src/components/shell/NavLinks.tsx",
    ]);
    for (const { name, text } of client) {
      expect(firstStatement(text), name).toBe('"use client";');
    }
  });

  it('keeps "use client" on the chip components, which take click handlers', () => {
    for (const name of ["Chip", "ChipGroup"]) {
      const file = sources.find((s) => s.name === `src/components/filters/${name}.tsx`);
      expect(firstStatement(file?.text ?? ""), name).toBe('"use client";');
    }
  });
});
