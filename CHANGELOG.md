# Changelog

All notable changes to `@haruhimemoe/ui` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). While on 0.x, a change to how a component looks is a minor version.

## [Unreleased]

## [0.3.0] - 2026-09-25

### Added

- `DiscordIcon`: the Discord logo as an inline SVG in the current text color, sized and hidden from screen readers like `GitHubIcon`. The path is Simple Icons' `discord.svg` (CC0 1.0). Discord's brand guidelines ask for the logo in color, black or white, so set one of those as the text color.
- `SiteFooter` takes `discordHref`. When set, a Discord icon link named "Discord" sits before the GitHub icon in the last row, at the same size. The logo stays white and dims on hover instead of changing color, as Discord's guidelines ask. Without `discordHref` the footer is unchanged.

## [0.2.0] - 2026-09-24

### Added

- `Card` takes `headingLevel` (`2`, `3` or `4`, default `2`), like `FilterPanel`, for a card that sits under another heading.

### Fixed

- `SiteHeader` and `NavLinks` no longer send tailwind-merge to the browser on every page. `NavLinks` is now a Server Component: it merges its classes on the server and hands finished class strings to a small client list that only reads the path for `aria-current`. In a Next.js 16 build, the nav's client chunk drops from about 12 KB to 4 KB gzipped. When no link can be the current page (all external or text-only), the list renders on the server alone and nothing in the nav hydrates.
- `Prose` no longer puts the `h2` or `h3` top margin above a heading that opens the block: its first child gets `mt-0`. The README shows the one-class pattern for content wrapped in `<section>`s.

## [0.1.0] - 2026-09-23

### Added

- `@haruhimemoe/ui/theme.css`: the osu!-web palette as Tailwind 4 colors (`b1` to `b6`, `c1` to `c4`, `h1`, `h2`) driven by one `--hue` (default 333), `--h1-l` and `--h2-l` to move `h1` and `h2` lightness at hues where the defaults fall under 4.5:1 contrast, Nunito as `font-sans` through `--font-nunito`, a visible focus ring, and an `@source` line so an app's Tailwind generates the components' classes.
- Basics: `Button`, `ButtonLink` (next/link, or a plain `<a>` for external URLs), `buttonClasses`, `Card`, `PageHeader`, `Notice` (info, warning, error; optionally live) and `Prose`.
- Forms: `TextInput`, `Textarea`, `Select` and `Checkbox`, each with a label, hint and error wired through `aria-describedby` and `aria-invalid`, plus `fieldClasses` for bare controls.
- Actions: `CopyButton` (a client component that reports "Copied." or a failure in an `<output>`), `Pagination` and `JsonLd`.
- Icons: `GitHubIcon`, `HaruhimeWordmark` and `HaruhimeWordmarkLink`.
- Filters: `Chip` and `ChipGroup` (toggle pills with `aria-pressed`), `RangeSlider` (two thumbs with editable ends, keyboard support, an open "+" top end, comma decimals, and an `inputMode` that switches to the text keyboard with a custom `parse`), `FilterRow` and `FilterPanel` (the osu! beatmap listing layout, collapsible on phones, with a live result count and "Clear filters").
- `className` on every component, and the extras passed to `buttonClasses` and `fieldClasses`, merge with tailwind-merge: a caller's class replaces a built-in one that sets the same property (`fieldClasses("w-auto")` drops `w-full`).
- Shell: `SiteHeader` (brand slot, nav links as data with `aria-current`, actions slot), `NavLinks`, `SiteFooter` (link columns as data, fine print, the haruhime.moe wordmark and a GitHub link) and `PageShell` (skip link, header, main, footer).

[unreleased]: https://github.com/haruhimemoe/ui/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/haruhimemoe/ui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/haruhimemoe/ui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/haruhimemoe/ui/releases/tag/v0.1.0
