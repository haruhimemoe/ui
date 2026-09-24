/**
 * @file tests/packaging.test.ts
 * @desc Checks on what ships: Next subpath imports carry ".js" (next has no exports map, so Node
 *       ESM and Vitest in a consuming app need the file name), every file that uses client hooks
 *       starts with "use client", the Tailwind peer range covers only versions with the utilities
 *       the components use, and no declaration maps point at source that isn't published.
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

describe("package manifest and build", () => {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const build = JSON.parse(readFileSync(path.join(root, "tsconfig.build.json"), "utf8"));

  it("asks for Tailwind 4.1 or later (wrap-anywhere), below 5", () => {
    expect(pkg.peerDependencies.tailwindcss).toBe(">=4.1.0 <5");
  });

  it("emits no declaration maps, since src is not published", () => {
    expect(pkg.files).not.toContain("src");
    expect(build.compilerOptions.declarationMap).not.toBe(true);
  });
});
