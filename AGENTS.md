# AGENTS.md

`@haruhimemoe/ui`: React components for the haruhime.moe osu! tools. Next.js 16, React 19 and Tailwind 4 are peer dependencies. `tsc` compiles `src/` to `dist/` one file at a time (no bundler); `src/theme.css` ships as `dist/theme.css`.

## Layout

- `src/components/<group>/<Name>.tsx`: one component per file. Groups: `basics`, `forms`, `actions`, `icons`, `filters`, `shell`.
- `src/components/<group>/<name>Styles.ts`: class builders shared by several components (like `buttonClasses`).
- `src/utils/`: internal helpers (`cx`, `isExternalHref`).
- `src/index.ts`: the public API. Export only what apps should use.
- `tests/components/<group>/<Name>.test.tsx`, `tests/utils/<name>.test.ts`, `tests/helpers/` (`axe.ts`).
- `scripts/check-consumer.mjs`: the consumer check (a throwaway Next.js app built against the packed tarball).

## Rules

- **Server-safe by default.** A component with no state, effects or browser APIs has no directive and works in Server Components. Put `"use client";` as the first line only in a file that needs it (hooks, event handlers it defines itself, `window`, `navigator`). Keep client files small; a server component can render a client one, not the other way round.
- **Next.js only.** Use `next/link` for internal links and `next/image` where it helps. No other framework shims.
- **No site-specific copy.** Text, links, URLs and brand names come in as props. Defaults may be generic English ("Clear filters"), never a site's own wording.
- **Look comes from the palette.** Use the theme's colors (`b1` to `b6`, `c1` to `c4`, `h1`, `h2`) and Tailwind's scale. No hex values, no `hsl()` in class names, no new CSS variables without adding them to `theme.css`. Ports of existing site components keep their classes exactly.
- **Native props pass through.** Props extend the element's own (`ComponentProps<"button">` and so on). `ref` is a normal prop in React 19: no `forwardRef`. Merge `className` with `cx`, caller last.
- **Accessible.** Every component has an axe check in its tests. Interactive ones get keyboard tests and correct ARIA.
- **Exact pins.** Every dependency version is exact. Peer dependencies are ranges.
- **Relative imports end in `.js`** (`./buttonStyles.js`), even from `.tsx` files. The published files are ESM, and Next resolves them strictly. Biome enforces this.
- Code style: Biome (2 spaces, double quotes, 100 columns, sorted Tailwind classes). Every file starts with the `@file / @desc / @author / @created / @modified` header. Exported functions and components get JSDoc with `@function`, `@param`, `@returns`.

## Before calling a change done

```sh
bun run check && bun run typecheck && bun run test && bun run build
bun run check:consumer   # packs the package into a throwaway Next.js app and runs next build
```
