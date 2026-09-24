# Contributing

## Setup

```sh
bun install
```

## Making a change

1. Read [AGENTS.md](./AGENTS.md).
2. Branch from `main` (`feat/<topic>`, `fix/<topic>`).
3. Write a failing test in `tests/`, make it pass, keep commits small and Conventional.
4. Every component gets an axe check (`expectNoAxeViolations` from `tests/helpers/axe.ts`). Interactive components also get keyboard tests.
5. For a visual change, attach a before and after screenshot to the PR. A change to how a component looks is a minor version bump while on 0.x.
6. Run the checks below.
7. Add a line to `CHANGELOG.md` under `## [Unreleased]`, in the right [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) section (Added, Changed, Deprecated, Removed, Fixed, Security).

## Checks

```sh
bun run check && bun run typecheck && bun run test && bun run build
```

`check` is Biome (`check:fix` to auto-fix). `build` compiles `src/` to `dist/` file by file and copies `theme.css` next to it.

```sh
bun run check:consumer
```

`check:consumer` packs the package, installs it into a throwaway Next.js 16 + Tailwind 4 app in your temp directory, renders every component on one page and runs `next build`. It checks that the build passes, that the library's classes end up in the app's CSS, that the pages prerender, and that the header's client list loads no tailwind-merge. It needs the network (npm and Google Fonts). Pass `--keep` (`node scripts/check-consumer.mjs --keep`) to leave the app in place and look at it.

## Releases

Releases are cut by the maintainers.
