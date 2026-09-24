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

## Releases

Releases are cut by the maintainers.
