# AGENTS.md

`@haruhimemoe/ui`: React components for the haruhime.moe osu! tools. Next.js 16, React 19 and Tailwind 4.1+ are peer dependencies. `tsc` compiles `src/` to `dist/` one file at a time (no bundler); `src/theme.css` ships as `dist/theme.css`. The README is the user documentation: keep it in step with the code.

## Layout

- `src/index.ts`: the public API. Export only what apps should use.
- `src/theme.css`: the palette as Tailwind colors (driven by `--hue`, `--h1-l`, `--h2-l`), the `font-sans` stack, the focus ring, and the `@source "./"` line that points an app's Tailwind at `dist/`.
- `src/components/<group>/<Name>.tsx`: one exported component per file. Groups: `basics`, `forms`, `actions`, `icons`, `filters`, `shell`.
- `src/components/<group>/<name>Styles.ts`: class builders shared by several components (`buttonClasses`, `fieldClasses`).
- Internal files, not exported from `src/index.ts`:
  - `forms/FieldFrame.tsx`: the label, hint and error layout, and the `<id>-hint` / `<id>-error` ids the fields share.
  - `actions/PaginationStatus.tsx`: the client "Page X of Y" text that takes focus when a Pagination link goes away.
  - `shell/links.ts` (`SiteLinkItem`, `canBeCurrent`, `ariaCurrentFor`), `shell/AutoLink.tsx` (next/link or a plain `<a>`, by href), `shell/NavItem.tsx` (one nav entry) and `shell/NavListClient.tsx` (the client list that sets `aria-current`).
- `src/utils/`: `cx` (tailwind-merge) and `isExternalHref`.
- `tests/components/<group>/<Name>.test.tsx`, `tests/utils/<name>.test.ts`, `tests/helpers/axe.ts` (`expectNoAxeViolations`), `tests/setup/dom.ts` (jest-dom matchers, cleanup).
- `tests/packaging.test.ts`: what ships. `.js` on next imports, `"use client"` on every file with hooks or browser APIs, no tailwind-merge in client files that server components render, the Tailwind peer range, no declaration maps, and the changelog's shape.
- `tests/theme.test.ts`: the theme's variables and the contrast values the README gives for other hues.
- `scripts/check-consumer.mjs`: the consumer check. It packs the package into a throwaway Next.js app, runs `next build`, and checks the README's claims about which navs hydrate and where tailwind-merge ships.

## Rules

- **Server-safe by default.** A component with no state, effects or browser APIs has no directive and works in Server Components. Put `"use client";` as the first line only in a file that needs it (hooks, event handlers it defines itself, `window`, `navigator`). Keep client files small; a server component can render a client one, not the other way round.
- **Client files that a server component renders get finished class strings.** `NavListClient` and `PaginationStatus` never import `cx`, so tailwind-merge stays on the server. `NavLinks` merges the classes and passes them down. `tests/packaging.test.ts` and the consumer check enforce this.
- **Next.js only.** Use `next/link` for internal links and `next/image` where it helps. No other framework shims. Import them with the `.js` suffix (`next/link.js`, `next/navigation.js`): next has no exports map, so bare specifiers break Node ESM and Vitest in consuming apps (`tests/packaging.test.ts` enforces this).
- **No site-specific copy.** Text, links, URLs and brand names come in as props. Defaults may be generic English ("Clear filters"), never a site's own wording.
- **Look comes from the palette.** Use the theme's colors (`b1` to `b6`, `c1` to `c4`, `h1`, `h2`) and Tailwind's scale. No hex values, no `hsl()` in class names, no new CSS variables without adding them to `theme.css`. Ports of existing site components keep their classes exactly.
- **Native props pass through.** Props extend the element's own (`ComponentProps<"button">` and so on). `ref` is a normal prop in React 19: no `forwardRef`. Merge `className` with `cx`, caller last.
- **Accessible.** Every component has an axe check in its tests. Interactive ones get keyboard tests and correct ARIA.
- **Exact pins.** Every dependency version is exact. Peer dependencies are ranges.
- **Relative imports end in `.js`** (`./buttonStyles.js`), even from `.tsx` files. The published files are ESM, and Next resolves them strictly. Biome enforces this.
- **Docs move with the code.** A new or changed prop, default or behavior updates the README in the same change, plus a line under `## [Unreleased]` in `CHANGELOG.md`. While on 0.x, a new API or a visual change is a minor version and a patch release holds only fixes (`tests/packaging.test.ts` checks this). Never edit a released changelog entry.
- Code style: Biome (2 spaces, double quotes, 100 columns, sorted Tailwind classes). Every file starts with the `@file / @desc / @author / @created / @modified` header. Exported functions and components get JSDoc with `@function`, `@param`, `@returns`.

## Before calling a change done

```sh
bun run check && bun run typecheck && bun run test && bun run build
bun run check:consumer   # packs the package into a throwaway Next.js app and runs next build
```

CI runs `bun run test:coverage`, which fails under 90% coverage of `src/`.
