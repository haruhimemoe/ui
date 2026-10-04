<p align="center"><a href="https://github.com/haruhimemoe/ui"><picture><source media="(prefers-color-scheme: light)" srcset="https://www.haruhime.moe/brand/repos/ui-banner-on-light.svg"><img alt="@haruhimemoe/ui" src="https://www.haruhime.moe/brand/repos/ui-banner.svg" width="640"></picture></a></p>

# @haruhimemoe/ui

React components for the haruhime.moe osu! tools on Next.js. It ships the osu!-web-style palette as a Tailwind 4 theme, plus buttons, links, badges, form fields and confirms, filter controls (toggle and choice chips, a two-thumb range slider, a filter panel), tables, osu! beatmap display pieces, a command palette (mod+k, with the defaults every tool shares) and the site header, footer, tabs, account menu and page frame. Most components are Server Components. The few that need the browser carry `"use client"` in their own files, so you import everything from one place.

See every component in its states at [haruhime.moe/ui](https://www.haruhime.moe/ui). The page names the version it runs.

This README describes version 0.8.0. Anything marked "since 0.8.0" is not in 0.7.0, anything marked "since 0.7.0" is not in 0.6.0, anything marked "since 0.6.0" is not in 0.5.0, anything marked "since 0.5.0" is not in 0.4.0, anything marked "since 0.4.0" is not in 0.3.0, anything marked "since 0.3.0" is not in 0.2.0, and anything marked "since 0.2.0" is not in 0.1.0. [CHANGELOG.md](./CHANGELOG.md) lists what changed in each version.

## Requirements

- Next.js 16 (app router)
- React 19
- Tailwind CSS 4.1 or later, below 5

These are peer dependencies. The package is ESM only, and its `engines` field asks for Node.js 22.12 or later.

## Install

```sh
bun add @haruhimemoe/ui
```

If the app doesn't have the peers yet:

```sh
bun add next react react-dom
bun add -d tailwindcss @tailwindcss/postcss
```

## Setup

**1. Load Tailwind through PostCSS** (skip this if the app already uses Tailwind 4). Without this file Next generates no utilities, and the components render unstyled with no build error.

```js
// postcss.config.mjs
export default { plugins: { "@tailwindcss/postcss": {} } };
```

**2. Import the theme after Tailwind** in the app's global stylesheet:

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "@haruhimemoe/ui/theme.css";
```

The theme does three things:

- Adds the palette as Tailwind colors, so `bg-b4`, `text-c1`, `border-h1` and the rest work in your own markup too.
- Adds a visible focus ring (`h1`, 2px) to everything on `:focus-visible`.
- Points Tailwind at the package's files with `@source`, so the classes the components use get generated. Without it the components render unstyled.

| Token | Use |
| --- | --- |
| `b1` to `b6` | Backgrounds, lightest (`b1`) to darkest (`b6`) |
| `c1` to `c4` | Text, brightest (`c1`) to most muted (`c4`) |
| `h1`, `h2` | Highlights: `h1` is the bright accent, `h2` the deeper one (primary buttons) |

**3. Load Nunito** with `next/font` as the `--font-nunito` variable on `<html>`. The theme's `font-sans` uses it, and falls back to the system font without it.

```tsx
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

// <html lang="en" className={nunito.variable}>
```

**4. Pick a hue (optional).** Every color comes from one `--hue` (default 333, pink). Set it on `:root` after the imports to recolor the whole app:

```css
:root {
  --hue: 200; /* blue */
  --h2-l: 42%; /* keeps white text on primary buttons at 4.5:1 */
}
```

At some hues the defaults drop below 4.5:1 contrast, so check yours. Two variables fix it:

- `--h2-l` sets the lightness of `h2` (default `45%`). White text on `h2` (primary buttons, the skip link) is under 4.5:1 for hues from about 23 to 205. Use `42%` at hue 200, `35%` at hue 150, or `31%` for any hue.
- `--h1-l` sets the lightness of `h1` (default `76%` since 0.7.0, `70%` before). At `76%`, `h1` text on `b5` (links in cards and prose) is at or above 4.5:1 at every hue. On `b4` ("Clear filters" in a filter panel) it dips under for hues from about 238 to 248. Use `77%` there.

The theme is dark only (`color-scheme: dark`).

## Example

```tsx
// src/app/layout.tsx
import { PageShell, SiteFooter, SiteHeader } from "@haruhimemoe/ui";
import { Nunito } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="bg-b5 font-sans text-c2 antialiased">
        <PageShell
          header={
            <SiteHeader
              brand={
                <Link href="/" className="font-extrabold text-c1 text-lg">
                  packs
                </Link>
              }
              links={[
                { label: "Public packs", href: "/packs" },
                { label: "Docs", href: "/docs" },
              ]}
            />
          }
          footer={
            <SiteFooter
              columns={[{ title: "Help", items: [{ label: "Docs", href: "/docs" }] }]}
              finePrint="Not affiliated with osu! or ppy Pty Ltd."
            />
          }
        >
          {children}
        </PageShell>
      </body>
    </html>
  );
}
```

```tsx
// src/app/page.tsx
import { ButtonLink, Card, PageHeader } from "@haruhimemoe/ui";

export default function Home() {
  return (
    <>
      <PageHeader
        title="Beatmap packs"
        lead="Pick maps, name the pack, share the link."
        actions={<ButtonLink href="/new">New pack</ButtonLink>}
      />
      <Card title="Recent packs" className="mt-8">
        Nothing here yet.
      </Card>
    </>
  );
}
```

## Server and client components

Import every component from `@haruhimemoe/ui`, in Server and Client Components alike.

- **Client components:** `CopyButton`, `Chip`, `ChipGroup`, `RangeSlider` and `FilterPanel`, and since 0.4.0 `AsyncButton`, `InlineConfirm`, `Disclosure`, `ChoiceChips`, `RadioGroup`, `TypeToConfirm` and `HeaderMenu`, and since 0.5.0 `Tabs`, `VisibilitySelect` and `ReportDisclosure`, and since 0.8.0 `CommandPalette` and `CommandPaletteButton`. Each file starts with `"use client"`. They merge their classes with tailwind-merge in the browser, so a page that renders any of them loads tailwind-merge (about 9 KB gzipped), however its header renders.
- **`SiteHeader` and `NavLinks`** are Server Components with a small client part (since 0.2.0; in 0.1.0 `NavLinks` is a client component). When a nav link can be the current page (a path such as `/packs`), a client list reads the path to set `aria-current`. With only external or text-only links, the nav renders on the server alone and nothing in it hydrates. Relative hrefs (`#main`) skip the client list too, but they render `next/link`, which hydrates.
- **Everything else is server-safe:** no state, no effects, no browser APIs.

A Server Component can't pass a function to a Client Component. So callback props (`onChange`, `onPressedChange`, `onClear`) have to come from your own `"use client"` file, like the filters example below. Props that are plain data (`CopyButton`'s `text`, `Chip`'s `pressed`) work from a Server Component. `Pagination` takes a function (`hrefFor`), but it is a Server Component itself, so that is fine anywhere. Its button mode (`onPageChange`) is a callback, so render that from a `"use client"` file.

## Props, classes and refs

- Every component takes its element's native props and passes them through (`id`, `aria-*`, `data-*`, event handlers). Each section below names that element. The tables list only the extra props.
- `ref` is a normal prop (React 19). It goes where the native props go: the outer element for most components, the control (`<input>`, `<select>`, `<textarea>`) for the form fields, and the `<button>` for `CopyButton`. On `PageShell` that is the wrapper `<div>`, not `<main>`.
- `className` is added after the built-in classes and wins on conflict: a class that sets the same property as a built-in one replaces it (merged with [tailwind-merge](https://github.com/dcastil/tailwind-merge)). `<Select className="w-auto">` drops the built-in `w-full`. On `DiscordIcon`, `GitHubIcon` and `HaruhimeWordmark`, `className` replaces the default size instead.

## Components

### Basics

#### `Button`

A pill button. Every native `<button>` prop.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"primary"` | `primary` is the `h2` pill that lights up to `h1` on hover, `secondary` is `b3`, `ghost` is transparent. |
| `size` | `"md" \| "lg"` | `"md"` | Height, padding and text size. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Never submits a form unless you ask for `"submit"`. |

#### `ButtonLink`

A link that looks like `Button`. Every `next/link` prop (`href`, `prefetch`, `replace`, `scroll`, `target`, `rel`...), plus `variant` and `size` as on `Button`.

- A string `href` with a scheme (`https:`, `mailto:`) or starting with `//` renders a plain `<a>`, and `next/link`'s own props are dropped. The href is read the way the browser reads it: leading spaces don't count and a backslash counts as a slash, so `/\host` and `\\host` are off-site too (since 0.4.0).
- That plain `<a>` with `target="_blank"` and no `rel` gets `rel="noreferrer"`. A `rel` you pass always wins. Internal links get only the `rel` you pass.

#### `buttonClasses`

`buttonClasses({ variant?, size?, className? }): string` returns the `Button` classes, for elements the components don't cover. Types: `ButtonVariant`, `ButtonSize`, `ButtonClassOptions`.

```tsx
<summary className={buttonClasses({ variant: "secondary" })}>More</summary>
```

#### `Card`

The osu!-web panel: rounded, `b4` background, `p-5`. Every native `<section>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | none | Rendered as a heading at the top (`<h2>` by default). It also names the section (`aria-labelledby`), which makes the card a region landmark. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | The title's heading level (type `HeadingLevel`). Use `3` or lower for a card that sits under another heading, such as a card inside a titled card. Since 0.2.0; `5` and `6` since 0.4.0. |

#### `PageHeader`

The page's one `<h1>`, with room for a lead line, a meta line and actions. Every native `<div>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The `<h1>`. |
| `lead` | `ReactNode` | none | A sentence under the title (`text-c3`). Rendered in a `<p>`, so inline content only. |
| `meta` | `ReactNode` | none | A small muted line (`text-c4`) for dates, counts or owners. Also a `<p>`. |
| `actions` | `ReactNode` | none | Buttons or links on the right. They wrap under the title on narrow screens. |

#### `Notice`

Short status text in one of three tones. Every native `<p>` prop. Type: `NoticeTone`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `tone` | `"info" \| "warning" \| "error"` | `"info"` | `text-c3`, `text-amber-300` or `text-rose-300`, at `text-sm`. |
| `live` | `boolean` | `false` | Make it a live region: `role="alert"` for errors, `role="status"` for the others. A `role` you pass wins. See below. |
| `as` | `"p" \| "div"` | `"p"` | Use `"div"` for block content such as a list of errors. |

A `status` region is only reliably announced when its content changes while it is on the page. A `live` info or warning notice that mounts with its text already inside (`{saved && <Notice live>Saved.</Notice>}`) can go unannounced. Keep it mounted and change its children, empty while there is nothing to say:

```tsx
<Notice live>{saved ? "Saved." : ""}</Notice>
```

An error notice (`role="alert"`) is announced either way.

#### `Prose`

Long-form typography for MDX, docs and legal pages. A `max-w-3xl` `<div>` that styles the `h2`, `h3`, `p`, `a`, `strong`, `ul`, `ol`, `li`, `code`, `pre`, `hr` and `table` elements inside it. Every native `<div>` prop. A `pre` scrolls sideways, so give it `tabIndex={0}` (through your Markdown renderer's `components` map) so keyboard users can reach the scroll; CSS can't add that.

The first element inside gets no top margin (`[&>:first-child]:mt-0`, since 0.2.0), so a heading that opens the block sits flush with what's above it instead of taking the `h2` or `h3` gap. The rule reaches direct children only. If you wrap the content in `<section>`s, the heading at the top of the first section keeps its margin. Reach one level deeper for that:

```tsx
<Prose className="[&>:first-child>:first-child]:mt-0">
  <section>
    <h2>What we store</h2>
    <p>Your osu! id and your packs.</p>
  </section>
  <section>
    <h2>How long we keep it</h2>
    <p>Until you delete your account.</p>
  </section>
</Prose>
```

Later sections keep their heading margin, which spaces them apart.

#### `Disclosure` (client)

Since 0.4.0. A button (at least 24px tall) that shows and hides a panel below it, with `aria-expanded` and `aria-controls` and a ▾ / ▴ arrow. The closed panel stays in the page, hidden, so fields inside keep their values. Every native `<div>` prop except `children`, for the wrapper.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `summary` | `ReactNode` | required | The button's text. It can change with the state. |
| `children` | `ReactNode` | required | The panel. |
| `defaultOpen` | `boolean` | `false` | Whether it starts open. |
| `open`, `onOpenChange` | `boolean`, `(open: boolean) => void` | none | Control the state from outside. |
| `buttonClassName`, `panelClassName` | `string` | none | Classes for the button and the panel, merged last. |

#### `TextLink`

Since 0.4.0. A text link: `next/link` inside the app, a plain `<a>` off-site (with `rel="noreferrer"` in a new tab), like `ButtonLink`. Every `next/link` prop. Type: `TextLinkVariant`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `variant` | `"accent" \| "plain"` | `"accent"` | `accent` is `h1` and underlined, for links in running text (it doesn't rely on color alone). `plain` is bold `c1`, underlined on hover, for a name or title in a list or table. |

```tsx
<p>
  Scripts can read public packs. <TextLink href="/docs/api">Read the API docs</TextLink>.
</p>
<TextLink href={`/packs/${pack.id}`} variant="plain">{pack.name}</TextLink>
```

#### `linkClasses`

Since 0.4.0. `linkClasses({ variant?, className? }): string` returns the `TextLink` classes, for an element that should look like one (a `<button>` that reads as a link, say). Type: `LinkClassOptions`.

#### `Badge`

Since 0.4.0. A small pill for a status or tag ("Unranked", "beta", a count). A `<span>` with no role, so screen readers read it in line with the text around it. Every native `<span>` prop. Type: `BadgeTone`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `tone` | `"neutral" \| "accent" \| "warning" \| "muted"` | `"neutral"` | `neutral` is `b3` with `c2` text, `accent` is `h1` with dark bold text, `warning` is a faint amber with bold amber text, `muted` is an outlined pill in small bold capitals (a "beta" tag). |

#### `Tabs` (client)

Since 0.5.0. A tab list for panels on the same page (use `LinkTabs` when each tab is its own URL): pill buttons with `role="tab"` in a `role="tablist"` named by `label`. The chosen tab is `aria-selected` and the only one in the Tab order (the first one when none is chosen). Left and Right move and wrap, Home and End jump to the ends; each picks the tab and focuses it. Controlled. Every native `<div>` prop except `onChange` and `children`, for the tablist. Types: `TabItem<T>`, `TabsProps<T>`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | required | The tablist's accessible name. |
| `idPrefix` | `string` | required | Prefix for the tabs' and panels' ids. |
| `tabs` | `readonly { id: T; label: ReactNode }[]` | required | The tabs, left to right. |
| `value` | `T` | required | The chosen tab's id. |
| `onChange` | `(id: T) => void` | required | Gets the picked tab's id. |

The panels are yours. `tabId(prefix, tab)` and `tabPanelId(prefix, tab)` (server-safe) give the ids that tie them together (`<prefix>-tab-<tab>`, `<prefix>-panel-<tab>`):

```tsx
<Tabs label="Editor view" idPrefix="ed" tabs={TABS} value={tab} onChange={setTab} />
<div role="tabpanel" id={tabPanelId("ed", tab)} aria-labelledby={tabId("ed", tab)}>...</div>
```

### Forms

The fields render a label, the control, an optional hint and an optional error, wired together for screen readers. They are Server Components: you pass the `id`, so they need no generated ids.

Shared props (type `FieldProps`), taken by `TextInput`, `Textarea`, `Select` and `Checkbox`:

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | required | The control's id. The label points at it. The hint gets `<id>-hint` and the error `<id>-error`. |
| `label` | `ReactNode` | required | The visible label. |
| `hint` | `ReactNode` | none | Help text in a `<div>`, linked with `aria-describedby`. On `Checkbox` the hint sits inline inside the label, so keep it to text there. |
| `error` | `ReactNode` | none | Error text in a `role="status"` `<div>` (`text-rose-300`; `role="alert"` before 0.7.0), so a list of errors is fine. Sets `aria-invalid` and links the text with `aria-describedby`. |
| `wrapperClassName` | `string` | none | Classes for the wrapper around the label, control, hint and error, for layout (`min-w-48 flex-1`). |

`className` goes on the control itself. Your own `aria-describedby` is kept after the hint and error ids.

#### `TextInput`

Every native `<input>` prop (`type`, `name`, `value`, `onChange`, `placeholder`, `required`...), plus the field props.

```tsx
<TextInput id="pack-name" label="Name" hint="Shown on the pack page." required />
```

#### `Textarea`

Every native `<textarea>` prop, plus the field props. At least `min-h-24` tall, resizes vertically.

#### `Select`

Every native `<select>` prop, plus the field props. Pass `<option>` elements as children.

#### `Checkbox`

Every native `<input>` prop except `type` (`checked`, `defaultChecked`, `onChange`, `name`, `disabled`...), plus the field props. The box is 24px (since 0.8.0; it was the browser's 13px), the label is bold `text-c1` and the hint follows it inline after a dot. Clicking anywhere on the row toggles it. The label alone is the accessible name; the hint is the description. An `aria-labelledby` you pass is added after the label (since 0.4.0; 0.3.0 dropped it).

#### `RadioGroup` (client)

Since 0.4.0. A native radio group on the `Checkbox` look: a `<fieldset>` named by its `<legend>`, one 24px radio per option with a bold label and an inline hint, then the group's hint and error. Each option's label is its accessible name and its hint its description. Arrow keys move and pick, as native radios do. Every native `<fieldset>` prop except `onChange`, `children` and `defaultValue`; `disabled` turns off every radio. Types: `RadioOption`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | The legend. |
| `options` | `readonly RadioOption[]` | required | `{ value: string; label: ReactNode; hint?: ReactNode; disabled?: boolean }` for each radio. |
| `value` / `defaultValue` | `string` | none | The picked value, held by you (`value`, with `onChange`) or by the group (`defaultValue`). |
| `onChange` | `(value: string) => void` | none | Gets the picked option's value. |
| `name` | `string` | generated | The radios' name, for a form. |
| `hint`, `error` | `ReactNode` | none | Under the options, linked to the group with `aria-describedby`. An error is a `role="status"` line (since 0.7.0; before, `role="alert"` and `aria-invalid` on each radio). |
| `required` | `boolean` | `false` | Every radio gets `required`. |

#### `TypeToConfirm` (client)

Since 0.4.0. A confirm for something that can't be undone: a `<form>` whose submit button stays off until the expected text is typed exactly (spaces around it don't count). The field has no autocomplete, autocapitalize or spellcheck. Enter submits once it matches. Children show above the field, to say what the action does. Every native `<form>` prop except `onSubmit`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | required | The text field's id, as on `TextInput`. |
| `expected` | `string` | required | What has to be typed. |
| `label` | `ReactNode` | `"Type <expected> to confirm"` | The field's label. |
| `hint`, `error` | `ReactNode` | none | As on `TextInput`. Pass `error` when the action fails. |
| `submitLabel` | `ReactNode` | required | The button's text. |
| `pendingLabel` | `ReactNode` | `submitLabel` | The button's text while `onConfirm` runs. It runs once at a time. |
| `onConfirm` | `() => void \| Promise<void>` | required | Runs on submit once the text matches. If it throws or rejects, the form stays as typed. |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"secondary"` | The button's look. |

```tsx
<TypeToConfirm id="delete-pool" expected={pool.name} submitLabel="Delete this pool" onConfirm={remove} error={error}>
  <p>This deletes the pool for everyone who edits it. It can't be undone.</p>
</TypeToConfirm>
```

#### `CharCounter`

Since 0.5.0. How much of a length limit a text uses: "1,234 / 60,000 characters" in `c3`, then bold rose with ": 1,500 over the limit" once past it (at the limit is not over). You count, so any rule works (a string's length, a BBCode counter). Every native `<p>` prop except `children`.

With `live` (since 0.7.0) an `<output>` live region inside it announces "1,500 over the limit" when the count goes over and nothing while under, so typing isn't read out number by number.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `count` | `number` | required | How many are used. |
| `limit` | `number` | required | The most allowed. |
| `unit` | `string` | `"characters"` | What is counted. |
| `live` | `boolean` | `false` | Announce the over-limit text to screen readers (since 0.7.0). |

#### `VisibilitySelect` (client)

Since 0.5.0. Who can see something: private, unlisted or public, each with a line that says who that is. As radios (a `RadioGroup`, every line shown as its option's description) or as a native select (a `Select`, the picked option's line as the hint). Controlled. Also exported: `VISIBILITIES` (`["private", "unlisted", "public"]`), the `Visibility` type, `VisibilityText` (`{ label: string; hint?: ReactNode }`) and `VISIBILITY_TEXT`, the default words ("Only you can see it.", "Anyone with the link can see it. It isn't listed.", "Anyone can see it, and it's listed.").

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `value` | `Visibility` | required | The picked visibility. |
| `onChange` | `(value: Visibility) => void` | required | Gets the new one. |
| `label` | `ReactNode` | `"Who can see it"` | The legend, or the select's label. |
| `as` | `"radio" \| "select"` | `"radio"` | Radios, or a dropdown. |
| `text` | `Partial<Record<Visibility, Partial<VisibilityText>>>` | none | Your words, merged over `VISIBILITY_TEXT` per visibility. |
| `id` | `string` | generated | The select's id, or the radios' name. |
| `hint` | `ReactNode` | none | Under the radios. On a select it replaces the picked option's line. |
| `error` | `ReactNode` | none | As on the fields. |
| `disabled` | `boolean` | `false` | Turns it off. |
| `className` | `string` | none | Classes for the fieldset, or the select's wrapper. |

```tsx
<VisibilitySelect
  label="Who can see this pool"
  value={visibility}
  onChange={setVisibility}
  text={{ private: { hint: "Only you and your editors." } }}
/>
```

#### `ReportDisclosure` (client)

Since 0.5.0. "Report this": a `Disclosure` holding a reason `Textarea` (required) and a submit button. `onSubmit` gets the trimmed reason and says how it went: `{ ok: true, message? }` replaces the form with a `role="status"` line (your message, like "You already reported it.", or `sentMessage`), which takes focus, since the button that had it is gone (since 0.7.0; the line is mounted empty from the start, so it is announced); `{ ok: false, message }` shows the message as the field's error and keeps what was typed for a retry. A throw reads as `failedMessage`. One send at a time. Type: `ReportResult`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `onSubmit` | `(reason: string) => Promise<ReportResult>` | required | Sends the report. |
| `summary` | `ReactNode` | `"Report"` | The disclosure button's text. |
| `label` | `ReactNode` | `"What's wrong with it?"` | The reason field's label. |
| `hint` | `ReactNode` | none | Help under the field. |
| `submitLabel`, `pendingLabel` | `ReactNode` | `"Send report"`, `"Sending…"` | The button's text, and while sending. |
| `sentMessage` | `ReactNode` | `"Thanks. Your report was sent."` | Said when the result has no message. |
| `failedMessage` | `ReactNode` | `"Couldn't send the report. Try again."` | Said when `onSubmit` throws. |
| `minLength`, `maxLength` | `number` | `3`, none | The reason's length limits. |
| `rows` | `number` | `3` | The field's height. |
| `className` | `string` | none | Classes for the wrapper around the disclosure and the status line. |

```tsx
<ReportDisclosure
  summary="Report this template"
  maxLength={500}
  onSubmit={async (reason) => {
    const response = await fetch(`/api/templates/${id}/report`, { method: "POST", body: JSON.stringify({ reason }) });
    return response.ok ? { ok: true } : { ok: false, message: "Reporting failed." };
  }}
/>
```

#### `fieldClasses`

`fieldClasses(className?: string): string` returns the field look (`b6` background, `b3` border, `h1` border plus the theme's 2px `h1` outline on focus, rose border when `aria-invalid`, and the `h1` border back when an invalid field has focus; before 0.7.0 the outline was hidden and only the border changed). Use it on a bare control that labels itself:

```tsx
<select aria-label="Move to" className={fieldClasses("w-auto")}>...</select>
```

### Actions

#### `CopyButton` (client)

A button that copies text, with the result in an `<output>` beside it that screen readers announce. Each press clears the message first, so a second copy is announced too. Only the latest press reports: an earlier copy that settles later (behind a permission prompt, say) doesn't overwrite it (since 0.4.0). If the clipboard is missing or refuses (an insecure page, say), it shows the failure message. Every `Button` prop except `onClick` and `children`; `className` and the native props go on the button.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `text` | `string` | required | The text to copy. |
| `label` | `ReactNode` | `"Copy"` | The button's text. |
| `copiedMessage` | `ReactNode` | `"Copied."` | Shown after a copy works. |
| `failedMessage` | `ReactNode` | `"Couldn't copy. Select the text and copy it by hand."` | Shown when it doesn't. |
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"secondary"` | As on `Button`. |
| `size` | `"md" \| "lg"` | `"md"` | As on `Button`. |
| `wrapperClassName` | `string` | none | Classes for the wrapper around the button and the message. |

#### `Pagination`

Previous and next pills around "Page X of Y": links (`hrefFor`), or since 0.4.0 buttons (`onPageChange`). Renders nothing when there is one page or none. Every native `<nav>` prop except `children`; `aria-label` defaults to `"Pages"`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `page` | `number` | required | The current page, starting at 1. |
| `pageCount` | `number` | required | How many pages there are. |
| `hrefFor` | `(page: number) => string` | one of the two | Link mode: builds a page's URL, e.g. `` (p) => `/packs?page=${p}` ``. |
| `onPageChange` | `(page: number) => void` | one of the two | Button mode (since 0.4.0): called with the page to show, for results fetched in place. `pageCount` may be `null` there. |
| `hasNext` | `boolean` | `false` | Button mode with `pageCount={null}`: whether a page comes after this one. |
| `previousLabel` | `ReactNode` | `"Previous"` | Text of the link to the page before. |
| `nextLabel` | `ReactNode` | `"Next"` | Text of the link to the page after. |
| `formatStatus` | `(page: number, pageCount: number) => ReactNode` | `"Page X of Y"` | The text in the middle. In button mode `pageCount` can be `null`, and the default reads "Page X". |

A `page` or `pageCount` straight from a URL is safe to pass (since 0.4.0): `NaN` reads as page 1 (and a `NaN` count as one page), a page past either end is pulled back inside, and fractions are dropped. `Number("abc")` shows page 1 with a Next link, and page 99 of 5 shows page 5.

The links use `next/link` with `rel="prev"` and `rel="next"`. On the first and last page one link goes away. If it had keyboard focus (Next pressed on page 4 of 5), focus moves to the "Page X of Y" text instead of falling back to the top of the page. `Pagination` stays a Server Component; that text is a small client component inside it.

In button mode, Previous and Next are `<button>`s. At the first or last page they stay in place, dimmed, with `aria-disabled="true"`: they keep focus and ignore presses. The status is a polite live region there, so each new page is announced.

```tsx
<Pagination page={page} pageCount={null} hasNext={data.hasMore} onPageChange={setPage} />
```

#### `AsyncButton` (client)

Since 0.4.0. A button that runs an async action and reports how it went in an `<output>` beside it that screen readers announce, like `CopyButton`. While it runs, the button keeps focus but ignores presses (`aria-disabled`). Every `Button` prop except `onClick`; the children are its text.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `action` | `() => ReactNode \| Promise<ReactNode>` | required | Runs on press. What it returns is the message ("Done."). |
| `pendingLabel` | `ReactNode` | the children | The button's text while the action runs. |
| `failedMessage` | `ReactNode \| ((error: unknown) => ReactNode)` | `"Something went wrong. Try again."` | Shown in `text-rose-300` when the action throws or rejects. |
| `wrapperClassName` | `string` | none | Classes for the wrapper around the button and the message. |

#### `InlineConfirm` (client)

Since 0.4.0. A two-step confirm in the page, no dialog: a trigger button, then the question with a cancel and a confirm button in its place. Opening moves focus to cancel, the safe choice. Cancel or Escape closes it and puts focus back on the trigger, and so does a confirm that resolves. The open confirm is a `<fieldset>` (a group) named by the question, so screen readers hear the question when focus arrives. Every native `<div>` prop except `children`, for the wrapper.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `trigger` | `ReactNode` | required | The first button's text. |
| `question` | `ReactNode` | required | Shown once the trigger is pressed. |
| `onConfirm` | `() => void \| Promise<void>` | required | Runs on confirm. While it runs, both buttons keep focus but ignore presses. If it throws or rejects, the confirm stays open: show the error yourself. |
| `confirmLabel`, `cancelLabel` | `ReactNode` | `"Confirm"`, `"Cancel"` | The two buttons' text. |
| `pendingLabel` | `ReactNode` | `confirmLabel` | The confirm button's text while `onConfirm` runs. |
| `onCancel` | `() => void` | none | Called when it closes without confirming. |
| `triggerProps` | `ButtonProps` | none | Props for the trigger (`aria-label`, `variant`, `disabled`). It is `secondary` by default. |
| `confirmVariant` | `"primary" \| "secondary" \| "ghost"` | `"secondary"` | The confirm button's look. Cancel is always `ghost`. |

If a confirm removes the item (and the `InlineConfirm` with it), move focus somewhere sensible yourself, such as the list's heading.

### Icons

#### `DiscordIcon`

Since 0.3.0. The Discord logo as an inline SVG in the current text color. Hidden from screen readers by default (`aria-hidden="true"`), so put a label on the link around it. Every native `<svg>` prop except `children` and `viewBox`.

The path is Simple Icons' `discord.svg` at tag 16.32.0 ([simple-icons/simple-icons](https://github.com/simple-icons/simple-icons), CC0 1.0). Discord is a trademark of Discord Inc. Its [brand guidelines](https://discord.com/branding) ask for the logo in color, black or white, and not recolored. The icon takes the current text color, so give the element around it one of those (`SiteFooter` uses white).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | `"size-5"` | Replaces the default size. |

#### `GitHubIcon`

The GitHub mark as an inline SVG in the current text color. Hidden from screen readers by default (`aria-hidden="true"`), so put a label on the link around it. Every native `<svg>` prop except `children` and `viewBox`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `className` | `string` | `"size-5"` | Replaces the default size. |

#### `HaruhimeWordmark`

The haruhime.moe wordmark as an inline SVG. It keeps the brand's own white and pink whatever `--hue` is. Every native `<svg>` prop except `children` and `viewBox`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `string` | `"haruhime.moe"` | The accessible name (`role="img"` with a `<title>`). |
| `decorative` | `boolean` | `false` | Hide it from screen readers, for use inside a labelled link. |
| `className` | `string` | `"h-6 w-auto"` | Replaces the default size. The width follows the height. |

#### `HaruhimeWordmarkLink`

A plain `<a>` around a decorative `HaruhimeWordmark`, dimmed until hovered. Every native `<a>` prop except `children`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `href` | `string` | `"https://www.haruhime.moe"` | Where it links. |
| `aria-label` | `string` | `"haruhime.moe"` | The link's accessible name. |
| `wordmarkClassName` | `string` | `"h-6 w-auto"` | Replaces the wordmark's size. |

### Filters

The osu! beatmap listing layout: a panel of rows, each with a label on the left and controls on the right. The interactive pieces take callbacks, so render them from a `"use client"` file:

```tsx
"use client";

import {
  ChipGroup,
  type ChipOption,
  FilterPanel,
  FilterRow,
  RangeSlider,
  type RangeSliderValue,
} from "@haruhimemoe/ui";
import { useState } from "react";

const MODS: ChipOption[] = [
  { value: "HD", label: "HD" },
  { value: "HR", label: "HR" },
  { value: "DT", label: "DT" },
];

export function PackFilters({ count }: { count: number }) {
  const [mods, setMods] = useState<string[]>([]);
  const [stars, setStars] = useState<RangeSliderValue>([0, null]);
  const active = mods.length > 0 || stars[0] > 0 || stars[1] !== null;

  return (
    <FilterPanel
      title="Filters"
      resultCount={`${count} packs`}
      active={active}
      onClear={() => {
        setMods([]);
        setStars([0, null]);
      }}
    >
      <FilterRow label="Mods">
        <ChipGroup label="Mods" hideLabel options={MODS} value={mods} onChange={setMods} />
      </FilterRow>
      <FilterRow label="Star rating">
        <RangeSlider
          label="Star rating"
          hideLabel
          min={0}
          max={10}
          step={0.1}
          openEnded
          value={stars}
          onChange={setStars}
        />
      </FilterRow>
    </FilterPanel>
  );
}
```

Give the `ChipGroup` or `RangeSlider` inside a `FilterRow` `hideLabel`. The row's label then shows once, and screen readers hear the row's name once instead of two nested groups with the same name.

#### `Chip` (client)

A toggle pill: a `<button>` with `aria-pressed`, `h1` when on. Every native `<button>` prop except `aria-pressed`, which `pressed` sets.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `pressed` | `boolean` | required | Whether it is on. |
| `onPressedChange` | `(pressed: boolean) => void` | none | Called with the new state on click, Enter or Space. |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Never submits a form by default. |
| `unavailableReason` | `ReactNode` | none | Since 0.4.0. Why the chip can't be pressed right now (EZ with HR picked). The chip is dimmed and never toggles, but stays in the tab order (`aria-disabled="true"`, not `disabled`), so keyboard and screen reader users find it and hear the reason as its description. A string reason is also its `title`. |

Your own `onClick` runs first. Call `event.preventDefault()` in it to skip the toggle.

#### `ChipGroup` (client)

A labelled row of chips for picking several values (mods, game modes). A `<fieldset>`; every native `<fieldset>` prop except `onChange` and `children`. `disabled` turns off every chip.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | Names the group. |
| `hideLabel` | `boolean` | `false` | For use inside a `FilterRow`, which names the row: the label doesn't render and the fieldset isn't a group of its own (`role="none"`). `disabled` still reaches every chip. |
| `options` | `readonly ChipOption[]` | required | `{ value: string; label: ReactNode; disabled?: boolean; unavailableReason?: ReactNode }` for each chip (`unavailableReason` since 0.4.0, as on `Chip`). |
| `value` | `readonly string[]` | required | The picked values. |
| `onChange` | `(value: string[]) => void` | required | Gets the new picked values, in the options' order, without duplicates. |

#### `ChoiceChips` (client)

Since 0.4.0. One choice from a few, as a real radio group drawn as chips (a status or type filter): native radios under one name, so Tab reaches the checked chip and the arrow keys move and pick. Same look as `Chip`, with the focus ring on the chip. A `<fieldset>` like `ChipGroup`, with the same `label` and `hideLabel`; every native `<fieldset>` prop except `onChange`, `children` and `defaultValue`. Type: `ChoiceChipOption`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | Names the group. |
| `hideLabel` | `boolean` | `false` | As on `ChipGroup`, inside a `FilterRow`. |
| `options` | `readonly ChoiceChipOption<T>[]` | required | `{ value: T; label: ReactNode; disabled?: boolean }` for each chip. |
| `value` | `T` | required | The picked value. |
| `onChange` | `(value: T) => void` | required | Gets the picked value. |
| `name` | `string` | generated | The radios' name, for a form. |

#### `RangeSlider` (client)

Two thumbs on one track with an editable box at each end, for star rating, length or BPM. A `<fieldset>`; every native `<fieldset>` prop except `onChange`, `children` and `inputMode`. Type: `RangeSliderValue` (`[number, number | null]`), so `useState<RangeSliderValue>` can pass its setter straight in.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | required | Names the group, and the ends as "Minimum *label*" and "Maximum *label*". |
| `hideLabel` | `boolean` | `false` | For use inside a `FilterRow`, which names the row: the label doesn't show and the fieldset isn't a group of its own (`role="none"`). The ends keep their "Minimum *label*" and "Maximum *label*" names. |
| `min`, `max` | `number` | required | The bounds. Given the wrong way round (`max` below `min`), they swap (since 0.4.0). |
| `step` | `number` | `1` | Step between values. Typed values snap to it. A step of `0`, below `0` or not finite counts as `1` (since 0.4.0), so `onChange` never gets `NaN`. |
| `value` | `readonly [number, number \| null]` | required | The range. A `null` top means no upper limit. |
| `onChange` | `(value: [number, number \| null]) => void` | required | Gets the new range. |
| `openEnded` | `boolean` | `false` | The top end at `max` means "no upper limit": it shows `max+` (like `10+`) and reports `null`. |
| `format` | `(n: number) => string` | `String` | Display text for the boxes and screen readers. |
| `parse` | `(text: string) => number \| null` | plain number | Reads a typed value back (without a trailing `+`). The default takes a comma as the decimal point (`5,5`). Pair it with `format` for `m:ss` lengths. |
| `inputMode` | `"decimal" \| "text" \| "numeric" \| ...` | `"decimal"`, or `"text"` with a custom `parse` | The on-screen keyboard for the two boxes. Phone decimal keypads have no `:`, so a custom `parse` gets the full keyboard. |
| `minLabel`, `maxLabel` | `string` | "Minimum *label*", "Maximum *label*" | The accessible names of the two ends. |
| `disabled` | `boolean` | `false` | Turns off both thumbs and both boxes. |

The thumbs can't cross. Arrow keys move one step, Page Up and Page Down ten, Home and End as far as the thumb can go. A box commits on blur or Enter, and Escape undoes the typing. An empty low box means `min`; an empty top box means open (with `openEnded`) or `max`. Values that come in out of range or crossed (from a URL, say) are shown clamped, and a `NaN` or infinite end counts as no limit on that end. When both thumbs sit on one value, dragging moves whichever end can go that way.

#### `FilterRow`

One labelled row: the label above the controls on phones, in a `w-28` column on the left from `sm` up. A `<fieldset>`; every native `<fieldset>` prop. Server-safe.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | The row's label. Also names the group. |

#### `FilterPanel` (client)

A titled panel of `FilterRow`s with a live result count and a "Clear filters" button. On phones the rows fold behind a button next to the title; from `sm` up they always show. Every native `<section>` prop except `title`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `title` | `ReactNode` | required | The heading. It also names the panel and the phone toggle. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `2` | The heading's level (type `HeadingLevel`). |
| `resultCount` | `ReactNode` | none | Shown in a polite live region, so each new count is announced. |
| `active` | `boolean` | `false` | Whether any filter is set. |
| `onClear` | `() => void` | none | The clear button's action. The button shows only when `active` is true and this is set. |
| `clearLabel` | `ReactNode` | `"Clear filters"` | The clear button's text. |
| `defaultOpen` | `boolean` | `false` | Whether the rows start open on phones. |

### Meta

#### `JsonLd`

schema.org structured data in a `<script type="application/ld+json">`. Every `<` in the output is escaped, so a string in the data can't close the tag. Every native `<script>` prop except `children`, `dangerouslySetInnerHTML`, `type` and `src` (`id` and `nonce` pass through).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `data` | `Record<string, unknown>` | required | The schema.org object. `@context` defaults to `https://schema.org`; set it in `data` to change it. |

### Shell

Links in the header and footer are data (type `SiteLinkItem`):

```ts
type SiteLinkItem = { label: string; href?: string; note?: string };
```

Paths use `next/link`; anything with a scheme (`https:`, `mailto:`) or starting with `//` is a plain `<a>` (and, since 0.4.0, `/\host`, `\\host` or a URL behind leading spaces, which browsers also read as off-site). An item without `href` shows as plain text. `note` adds a word beside it in small uppercase letters (`{ label: "Sheets", note: "soon" }`). The header dims text-only items and shows the note only on them. The footer shows a note beside a link too.

#### `SiteHeader`

The dark top bar: brand on the left, the nav, and an actions slot on the right. Every native `<header>` prop except `children`. A Server Component; the nav list inside is `NavLinks`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `brand` | `ReactNode` | required | The left side, usually a home link with the site's name or wordmark. |
| `links` | `readonly SiteLinkItem[]` | `[]` | The nav entries. No nav renders when empty. |
| `navLabel` | `string` | `"Main"` | The nav landmark's accessible name. |
| `navAlign` | `"start" \| "center"` | `"start"` | `"start"` puts small `text-c3` links right after the brand. `"center"` centers larger `text-c2` links in the free space. |
| `actions` | `ReactNode` | none | The right side, e.g. an account menu. |

The link for the current page gets `aria-current="page"` and lights up. A section link gets `aria-current="true"` on pages under it (`/packs` while on `/packs/123`). `/` only matches itself.

Only a path inside the app can be the current page. External URLs, relative hrefs (`#main`, `?page=2`) and text-only entries never are. Since 0.2.0, when no link can be, the nav skips the client list. With only external and text-only entries, it renders on the server alone and nothing in it hydrates. A relative href still renders `next/link`, which hydrates. When a link can be the current page, a small client list marks it. In 0.1.0 the whole nav is a client component, so it always hydrates.

Rendered from a Server Component, `SiteHeader` and `NavLinks` merge the nav's classes on the server, so tailwind-merge stays out of the browser (since 0.2.0; in 0.1.0 the nav always brings tailwind-merge to the browser). Rendered inside a Client Component, they merge them in the browser and bring tailwind-merge with them.

Next bundles every client component a route imports, rendered or not. So a page with `SiteHeader` still downloads the client list's small chunk (mostly `next/link`), even when the nav rendered on the server alone.

#### `NavLinks`

The `<ul>` of links `SiteHeader` uses, for building your own header. Put it inside a `<nav>`. Every native `<ul>` prop except `children`. Type: `SiteNavAlign`. It works in Server and Client Components. Since 0.2.0 it is a Server Component with a small client part (in 0.1.0 it is a client component). From a Server Component it behaves like `SiteHeader`'s nav. Inside a Client Component (a header with a menu toggle, say), it renders in the browser with the rest of that component: it merges its classes there, so tailwind-merge ships in that page's bundle.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `links` | `readonly SiteLinkItem[]` | required | The entries. An entry without an `href` renders as dimmed text with its `note` (no `aria-disabled` since 0.7.0: it isn't a control). |
| `align` | `"start" \| "center"` | `"start"` | As `navAlign` on `SiteHeader`. |

#### `SiteFooter`

Link columns, an extra slot, fine print, the haruhime.moe wordmark, a GitHub icon link and an optional Discord icon link. Every native `<footer>` prop except `children`. Type: `SiteFooterColumn` (`{ title: string; items: readonly SiteLinkItem[] }`).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `columns` | `readonly SiteFooterColumn[]` | `[]` | The columns sit in one `<nav>` (`navLabel`); each is a `<section>` headed by its title. Up to four columns side by side from `sm` up. Before 0.7.0 each column was its own `<nav>`. |
| `navLabel` | `string` | `"Footer"` | The nav landmark's name. Keep it different from `SiteHeader`'s `navLabel`, so the two landmarks tell apart (since 0.7.0). |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | The column titles' heading level (since 0.7.0). |
| `tools` | `HaruhimeToolsOptions` | none | Adds a "haruhime tools" column: the other live haruhime.moe tools as "name: blurb" links, then "All tools" on www. Options: `current` (the tool this footer is on, left out), `title` (`"haruhime tools"`), `allLabel` (`"All tools"`, `false` drops it), `allHref` (`"https://www.haruhime.moe"`), `position` (where among `columns`, default `1`, clamped). Since 0.6.0. |
| `extra` | `ReactNode` | none | Shown above the fine print, e.g. a "clear local data" button. |
| `finePrint` | `ReactNode` | none | One line of small print, in a `<p>`. |
| `parentLink` | `boolean` | `true` | Show the haruhime.moe wordmark linking the parent site. With it, the last row holds the wordmark and the icons, and the fine print sits above. Without it, the fine print shares the row with the icons. |
| `parentHref` | `string` | `"https://www.haruhime.moe"` | Where the wordmark links. |
| `githubHref` | `string \| false` | `"https://github.com/haruhimemoe"` | Where the GitHub icon links. `false` leaves it out. |
| `githubLabel` | `string` | `"haruhimemoe on GitHub"` | The GitHub link's accessible name. |
| `discordHref` | `string` | none | Where the Discord icon links, such as your server's invite (`https://discord.gg/...`). Without it there is no Discord icon. The icon sits before the GitHub icon at the same size. It stays white (`text-c1`) and dims on hover instead of changing color, since Discord's brand guidelines ask that the logo not be recolored. Since 0.3.0. |
| `discordLabel` | `string` | `"Discord"` | The Discord link's accessible name. Since 0.4.0. |

`HARUHIME_TOOLS` (each `{ id, name, href, blurb }`, type `HaruhimeTool`, ids `HaruhimeToolId`: `"packs" | "pools" | "bb"`) and `haruhimeToolsColumn(options)` (the same column as plain data, for a footer you lay out yourself) are exported too. Since 0.6.0. They are the one place outside the wordmark that names the haruhime.moe tools: a tool joins the list when it goes live.

#### `LinkTabs`

Since 0.4.0. A row of link tabs (Pools / Maps, All / Hidden): a named `<nav>` with a list of pill links. The current one gets `aria-current="page"` and a `b3` pill (underlined in forced colors mode). These are links, not ARIA tabs, since each loads its own URL. A Server Component: you say which is current. Every native `<nav>` prop except `children`. Type: `LinkTabItem`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `string` | required | The nav landmark's accessible name. |
| `items` | `readonly LinkTabItem[]` | required | `{ href: string; label: ReactNode; current?: boolean }` for each tab, each with its own href. |

#### `HeaderMenu` (client)

Since 0.4.0. The header's account menu: a button (an avatar and a name, say; at least 24px tall) that shows a small panel of links and extra controls such as a sign-out button. It is a disclosure, not an ARIA menu: the button has `aria-expanded` and `aria-controls`, and Tab moves through the panel. Escape closes it and puts focus back on the button; a click outside it, a click on one of its links, or focus leaving it closes it too. Every native `<div>` prop except `children`, for the wrapper. Type: `HeaderMenuItem`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `label` | `ReactNode` | required | The button's content. |
| `items` | `readonly HeaderMenuItem[]` | `[]` | `{ href: string; label: ReactNode }` links, top to bottom. |
| `children` | `ReactNode` | none | Shown after the links, such as a sign-out button. |
| `align` | `"start" \| "end"` | `"end"` | Which edge of the button the panel lines up with. |
| `buttonLabel` | `string` | none | The button's accessible name, when its content is only an image. |
| `buttonClassName` | `string` | none | Classes for the button, merged last. |

#### `PageShell`

The page frame: a skip link, the header, `<main>` and the footer, with the footer held to the bottom on short pages. Every native `<div>` prop; they and `ref` go on the outer wrapper `<div>`. Use `mainId` and `mainClassName` for `<main>`, and `document.getElementById(mainId)` to reach it from script.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `children` | `ReactNode` | none | The page, inside `<main>` (`max-w-5xl`, centered, `px-4 py-10`). |
| `header` | `ReactNode` | none | Above `<main>`, usually a `SiteHeader`. |
| `footer` | `ReactNode` | none | Below `<main>`, usually a `SiteFooter`. |
| `skipLabel` | `string` | `"Skip to content"` | The skip link's text. It is the first thing Tab reaches and shows only when focused. |
| `mainId` | `string` | `"main"` | `<main>`'s id, which the skip link targets. |
| `mainClassName` | `string` | none | Extra classes for `<main>`, e.g. `"max-w-7xl"`. |

### osu!

Since 0.4.0. Display pieces for beatmaps and mod pools. They take plain values (no osu! API types) and are Server Components.

#### `StarRating`

A star-rating pill colored on osu!'s difficulty spectrum: "★ 5.23" on the rating's color, dark text up to 6.5 and osu!'s pale yellow above, except where neither clears 4.5:1 on the pill (the violet band around 6.5 to 7 stars), which gets white (since 0.7.0). The spectrum is osu!'s own, the same at every `--hue`, so the pill sets its colors inline. Screen readers hear "5.23 stars" and the `label` after it. Every native `<span>` prop except `children`; a `style` you pass merges over the colors.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `value` | `number` | required | The rating, shown with two decimals. `NaN` shows as "–" on grey. |
| `label` | `ReactNode` | none | Read after the rating by screen readers, e.g. "with HR" (what a `title` tells mouse users). |
| `unit` | `string` | `"stars"` | The word read after the number. |

#### `BeatmapStats`

A beatmap's CS, AR, OD, HP, BPM and length as a compact `<dl>`, in that order. Stats you leave out (or that aren't finite) don't show. CS, AR, OD, HP and BPM are `<abbr>`s titled with their full names; screen readers get the full name instead of the letters (since 0.7.0). Every native `<dl>` prop except `children`. Type: `BeatmapStatKey`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `cs`, `ar`, `od`, `hp` | `number \| null` | none | Shown with at most one decimal. |
| `bpm` | `number \| null` | none | Shown whole. |
| `lengthSeconds` | `number \| null` | none | Shown as `m:ss`, or `h:mm:ss` from an hour. |
| `labels` | `Partial<Record<BeatmapStatKey, ReactNode>>` | none | Replaces a label (`{ length: "Länge" }`). |

#### `ModBadge`

A mod pool slot's pill (`NM1`, `HD2`, `TB`), colored by the first two letters: NM sky, HD amber, HR rose, DT and NC violet, FM emerald, TB orange, with dark text. Anything else is a `b3` pill. Every native `<span>` prop; `children` replace the text, and `className` recolors it (`bg-pink-300` for a custom bucket).

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `mod` | `string` | required | The mod or slot label. |

### MDX (server)

Since 0.9.0. Three subpaths, so an app that never renders Markdown loads none of this: `@haruhimemoe/ui/mdx` (the React pieces: `mdxComponents`, `CodeBlock`, `Callout`), `@haruhimemoe/ui/remark` (plain functions, no React, for `@next/mdx` and `react-markdown`'s `remarkPlugins`), and `@haruhimemoe/ui/shiki` (opt-in code highlighting). The root `@haruhimemoe/ui` export is unchanged.

**With `@next/mdx`:**

```ts
// next.config.ts
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  // Turbopack only takes MDX plugins as module names, not imported functions.
  options: { remarkPlugins: ["remark-gfm", "@haruhimemoe/ui/remark"] },
});

export default withMDX({ pageExtensions: ["ts", "tsx", "md", "mdx"] });
```

```tsx
// mdx-components.tsx
import { mdxComponents } from "@haruhimemoe/ui/mdx";
import "@haruhimemoe/ui/shiki"; // optional: see "Code highlighting" below

export function useMDXComponents(components) {
  return { ...mdxComponents, ...components };
}
```

`remark-gfm` isn't ui's dependency (pin it yourself); without it `@next/mdx` has no pipe tables, and a table with no GFM stays a paragraph.

**With `react-markdown`:**

```tsx
import { mdxComponents } from "@haruhimemoe/ui/mdx";
import remarkHaruhime from "@haruhimemoe/ui/remark";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";

<Markdown components={mdxComponents} remarkPlugins={[remarkGfm, remarkHaruhime]}>
  {body}
</Markdown>;
```

If you sanitize the output (`rehype-sanitize` or your own schema), allow `className` on `code` matching `/^language-/`, `dataMeta` on `code`, `dataCallout` on `blockquote`, and `id` on `h2`/`h3`: the remark plugin writes these, and `mdxComponents` reads them back.

#### `mdxComponents`

The element overrides apps pass to `@next/mdx`'s `useMDXComponents` or `react-markdown`'s `components`: `{ a, blockquote, h2, h3, pre, table }`. Spread it and add your own (`{ ...mdxComponents, Example: LiveExample }`).

| Element | Renders |
| --- | --- |
| `a` | `https://` opens in a new tab (`rel="noopener noreferrer"`); a same-page `#hash` is a plain anchor; everything else goes through `AutoLink` (`next/link`, or a plain `<a>` off-site). |
| `h2`, `h3` | The heading with its id (from the remark plugin, or a `slugify` of its own text) and, beside it, a `#` anchor link (`aria-label="Link to section: …"`, always visible in `c4`, turning `h1` on hover, never only on hover). |
| `pre` | Reads its single `code` child (text, `language-x` class, the fence's meta) and renders `CodeBlock`. Anything else (a `pre` with no single `code` child) renders as a plain, focusable `<pre>`. |
| `table` | The table wrapped in a focusable, named scroll region: `<div role="group" tabIndex={0} aria-label="…">`, labelled by the table's `<caption>` text, or `"Table"` without one. |
| `blockquote` | A blockquote the remark plugin marked `data-callout` renders as `Callout` of that type; any other blockquote renders plainly. |

#### `CodeBlock`

An async Server Component: a header bar (the fence's `title`, or the language name, or `"Code"`) with a copy button, over a `<pre role="group" tabIndex={0}>` of lines. Every native `<div>` prop goes on the wrapper except `code`, `lang`, `title` and `highlight`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `code` | `string` | required | The text. Any line endings (`\r\n`, a trailing newline) are normalized; a lone trailing newline doesn't add a phantom last line. |
| `lang` | `string` | none | A Shiki language id or alias (`ts`, `tsx`, `js`, `json`, `bash`/`sh`/`shell`, `css`, `html`, `md`/`markdown`, `diff`, `yaml`/`yml`). Unknown languages render plain. |
| `title` | `string` | none | Shown in the header instead of the language; also names the `<pre>` and the copy button ("Copy x.ts"). |
| `highlight` | `readonly number[]` | `[]` | 1-based line numbers to mark: an `h1` left border and a `b4` tint (`forced-colors:border-[Highlight]` keeps the mark visible under Windows high contrast). |

In MDX, pass these through the fence's meta string instead of writing `CodeBlock` by hand: ` ```ts title="pool.ts" {2,4-5}`. `parseCodeMeta` reads `title="…"` or `title='…'` and `{1,3-5}` ranges (anything else is ignored, and it never throws); the language comes from the fence's own tag.

#### Code highlighting

`shiki` is an optional peer dependency: apps that never render code don't install it, and ui's only runtime dependency stays `tailwind-merge`. An app that renders code:

```sh
bun add shiki
```

```ts
// in the module that renders code: mdx-components.tsx, or next to your react-markdown call
import "@haruhimemoe/ui/shiki";
```

That import is a side effect: it registers a Shiki core highlighter (`shiki/core` with the no-WASM JS regex engine, loaded through dynamic `import()`, built once per process) under `@haruhimemoe/ui/mdx`'s `CodeBlock`. It isn't "once anywhere": registration lives in the module graph that imported it, so a route that renders `CodeBlock` without this import in its own graph may or may not highlight depending on load order. Put it in `mdx-components.tsx` (reaches every MDX page) or directly beside your `react-markdown` renderer. `package.json`'s `sideEffects` lists `./dist/shiki.js`, so bundlers don't drop the bare import; Turbopack resolves even a dynamic `import("shiki/core")` at build time, which is why highlighting is a separate subpath instead of code `CodeBlock` imports unconditionally.

Without the import, `CodeBlock` renders plain, unstyled lines, and in development it logs one `console.warn` per process ("code blocks aren't highlighted…"). A highlighter that fails to load (a missing package, a broken build) falls back the same way, warned once.

Tokens render as `<span style={{ color: "var(--shiki-token-…)" }}>`, no injected Shiki HTML, through `--shiki-*` custom properties in `theme.css` (see "Setup" above for loading it). They follow `--hue` like the rest of the palette: `--shiki-foreground` and `--shiki-background` are `c2`/`b6`; `--shiki-token-keyword`, `-string`, `-string-expression`, `-constant`, `-function`, `-parameter`, `-punctuation` and `-link` are hue-offset HSL values, each at or above 4.5:1 against both `b6` (the block's background) and `b4` (a highlighted line's tint) at every integer hue; `-comment` uses `c4`. `keyword` and `link` get their own hue-derived lightness instead of reusing `h1`: `h1`'s default (76%) drops to 4.33:1 against `b4` at hue 240, and a `--h1-l` override written for other text shouldn't silently recolor code too.

#### `Callout`

A labelled aside: a left-border panel (`role="note"`) with an icon and a bold label, usable directly in MDX or rendered by `mdxComponents`' `blockquote` override.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `type` | `"note" \| "tip" \| "warning"` | `"note"` | The border color, icon and default label (`h1` / `c2` / `h2` border; "Note" / "Tip" / "Warning"). The type is in the text, never color alone. |
| `title` | `ReactNode` | the type's label | Replaces the default label. |
| `children` | `ReactNode` | required | The body. |

GitHub-style callout syntax works through the remark plugin: a blockquote whose first paragraph starts with `[!NOTE]`, `[!TIP]`, `[!WARNING]` (case-insensitive; GitHub's `[!IMPORTANT]` maps to `tip`, `[!CAUTION]` to `warning`) becomes a `Callout` of that type, the marker stripped:

```md
> [!NOTE]
> Packs are deleted after 90 days of no edits.
```

Or write `<Callout type="tip">` directly in an `.mdx` file.

#### `@haruhimemoe/ui/remark`

Plain functions (no React), for `remarkPlugins`. Default export `remarkHaruhime(options?)` runs all three transforms below in order and is what Turbopack needs by module name: `remarkPlugins: ["@haruhimemoe/ui/remark"]`. Named exports `remarkCodeMeta`, `remarkCallouts` and `remarkHeadingIds` run one each, for `react-markdown`'s array form or a custom pipeline.

| Option (all default `true`) | Turns off |
| --- | --- |
| `codeMeta` | Copying a fenced code block's meta string onto `data-meta`, which `CodeBlock`'s fence syntax (`title=`, `{…}`) reads. |
| `callouts` | The `[!NOTE]` / `[!TIP]` / `[!WARNING]` blockquote markers. |
| `headingIds` | Slugged, deduplicated ids on `h2`/`h3` (a heading that already has one keeps it). |

`slugify(text)` and `createSlugger()` are also exported: lowercase, Unicode-aware (letters, marks, digits and underscores from any script survive; everything else but whitespace and hyphens is dropped), spaces to hyphens, repeats suffixed `-1`, `-2` like GitHub's own heading anchors. `@haruhimemoe/ui/mdx` re-exports `slugify` for apps that build their own heading links.

#### Accessibility

- The `<pre>` `CodeBlock` renders and the `<div>` `mdxComponents`' `table` wraps a table in are both `role="group"` with `tabIndex={0}` and an `aria-label` (`pre` may not be named on its own): keyboard users can reach a sideways scroll that a mouse would otherwise require. Do the same for any `pre` you render yourself inside `Prose`.
- Heading anchor links are always visible (`c4`, turning `h1` on hover), never hover-only, and at least 24px; their `aria-label` ("Link to section: …") keeps the heading's own accessible name as its own text.
- `CodeCopyButton` reports "Copied" or "Copy failed" through a live region mounted before use, like `CopyButton`.
- `Callout` is `role="note"` with the type in text, not color alone; highlighted code lines keep a `forced-colors` border so Windows high contrast mode still shows them.

`Prose` (in "Basics" above) styles a direct-child `pre` with its own fence look, so `CodeBlock` (which isn't a direct child; `mdxComponents`' `pre` override renders it) is untouched when both are in play. `Prose` also styles `blockquote`.

### Palette (client)

Since 0.8.0. A command palette: press Ctrl K (⌘K on a Mac) anywhere on the page and a dialog opens with a search box over everything the app can do. It is one component for every haruhime tool: `CommandPalette` is the engine, `siteCommands` the defaults every site shares, and each app plugs in its own commands, pages and search providers through the same `Command` and `Provider` types. No new dependency.

Mount it once, from a client file, since commands carry functions. The button goes in `SiteHeader`'s `actions`:

```tsx
// src/components/Palette.tsx
"use client";

import { type Command, CommandPalette, siteCommands } from "@haruhimemoe/ui";
import { HEADER_LINKS } from "@/constants/nav";

const COMMANDS: Command[] = [
  ...siteCommands({ pages: HEADER_LINKS, tools: "packs", repo: "https://github.com/haruhimemoe/packs.haruhime.moe" }),
  { id: "pack.new", title: "New pack", group: "Packs", shortcut: "g n", run: (ctx) => ctx.navigate("/new") },
];

export function Palette() {
  return <CommandPalette storageKey="packs" commands={COMMANDS} />;
}
```

```tsx
// app/layout.tsx
<SiteHeader brand={...} links={HEADER_LINKS} actions={<CommandPaletteButton>Search</CommandPaletteButton>} />
<Palette />
```

#### `CommandPalette`

The dialog. Renders nothing until opened, then a native `<dialog>` (modal, backdrop, scroll locked) with a combobox over a listbox. Mount one per app.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `commands` | `readonly Command[]` | required | The root rows. Read on every open, so a command's `when` and titles can change. |
| `providers` | `readonly Provider[]` | none | Searched at the root as you type, once the query reaches each one's `minLength`. |
| `storageKey` | `string` | `"default"` | Namespaces the recents in `localStorage` (`haruhime:palette:<key>`). |
| `hotkey` | `string` | `"mod+k"` | The toggle, in shortcut syntax. `mod` is ⌘ on a Mac and Ctrl elsewhere. |
| `placeholder` | `string` | `"Search commands…"` | The root input's placeholder. |
| `label` | `string` | `"Command palette"` | The dialog's and the input's accessible name. |
| `calculator` | `boolean` | `true` | A `= 42` row for a query that computes (`2*21`), first in the list; Enter copies the result. |
| `recents` | `boolean` | `true` | A Recent group of the last five commands run, and a ranking boost by how often each ran. |
| `className` | `string` | none | Classes for the panel. |

Keys: ↑ ↓ move (wrapping), Home and End jump, Enter runs the active row, Escape goes back a level and then closes, Backspace on an empty input goes back a level, Tab stays put (focus never leaves the input), and the hotkey (a combo, not a chord) toggles the palette from anywhere, a field included, without typing into it. A click on the backdrop closes it, and so does the browser (a back gesture on Android). Focus returns to whatever had it. The footer reads the result count, or the copy outcome until the query changes.

Typing filters the rows with a fuzzy match: a letter or digit must start a word or follow the previous match ("cpu" finds "Copy page URL", "go" doesn't find "Sign out"), except in scripts without case or spaces (kanji, kana), which match anywhere; the title weighs most, then `keywords`, `subtitle` and `group`. Matched letters are marked. With an empty query every command is listed under its group, in order, after the Recent group.

#### `Command`

| Field | Type | What it does |
| --- | --- | --- |
| `id` | `string` | Unique in the app. Recents are stored by it, so keep it stable when a title changes. |
| `title` | `string` | The row. |
| `subtitle?` | `string` | A smaller second line. |
| `icon?` | `ReactNode` | A 20px slot before the title. |
| `keywords?` | `string[]` | Matched at a lower weight than the title. |
| `group?` | `string` | The heading the row sits under. Default `"Commands"`. |
| `shortcut?` | `string` | Shown as keys on the row, and active while the palette is mounted and closed: a combo (`"mod+shift+c"`, `"?"`) or a chord of two bare keys (`"g p"`, within 800 ms). Never fires from a field. |
| `when?` | `(ctx) => boolean` | Hidden when false. Read on every render of the list. |
| `run?` | `(ctx, args) => void \| Promise<void>` | What it does. A rejection is logged; the palette stays usable. |
| `page?` | `Page` | Instead of `run`: Enter pushes this page (its `commands` and `providers`), with the page's title as a crumb. |
| `args?` | `ArgSpec[]` | Prompts collected before `run`, one at a time: `{ name, label, type: "text" \| "number" \| "choice", choices?, validate? }`. A `choice` lists its `choices` as rows (fuzzy-filtered); `text` and `number` take the input on Enter; `validate` returns a message to block it. `run` gets them as `args[name]`. |
| `closeOnRun?` | `boolean` | Default `true`. |

`PaletteContext` (the `ctx` a command runs with): `navigate(href)` (`router.push`), `close()`, `push(page)` (opens the palette first when closed), `copy(text)` (clipboard, announcing "Copied" or the failure), `pathname`, and `commands` (every root command, so a page can list them).

#### `Provider`

`{ id, group?, minLength? = 2, debounceMs? = 200, search(query, signal) }`. `search` returns `Command[]` for the query and must honor the `AbortSignal`: a newer query aborts the older search, and a late result is dropped. Its rows sit under `group` (default "Results") after the static matches; while it runs the list is `aria-busy`, says "Searching…" and keeps the last rows in place, so nothing flashes per keystroke; an error says "Couldn't search, try again". `fuzzyScore(query, text)` is exported so a provider can rank its rows the way the palette does.

#### `openCommandPalette(page?)`

Opens the mounted palette from anywhere (a button, a tour), onto `page` when given. It dispatches a `window` event, so it works from a Server Component's client child without a ref.

#### `CommandPaletteButton` (client)

A ghost `Button` with a magnifier, your `children` beside it and the hotkey hint (`Ctrl K`, or `⌘K` once a Mac is detected after mount; decorative, so it isn't part of the name). With `children`, that text is the button's name; without, `label` is (default "Open command palette"). Every `Button` prop except `onClick`.

#### `siteCommands(options)`

The defaults every tool gets, in order: Navigate, Page, Account, Help. Pass only what the app has.

| Option | Type | What it builds |
| --- | --- | --- |
| `pages` | `SiteLinkItem[]` | "Go to <label>" per linked nav item (`site.go.<slug>`). |
| `tools` | `HaruhimeToolId \| false` | "Open <tool>" for every other tool in `HARUHIME_TOOLS` plus "Open haruhime.moe" (`site.tool.<id>`, `site.tool.home`). `false` leaves them out. |
| `repo` | `string` | "Open on GitHub" (`site.github`) and "Report a bug" (`site.report`, the repo's new-issue page). |
| `account` | `{ signedIn, signInHref, accountHref?, signOutHref? }` | "Sign in" (`site.sign-in`) while signed out; "My account" (`site.account`) and "Sign out" (`site.sign-out`, navigated, as next-kit's route expects) while signed in. |
| `include` | `("navigate" \| "page" \| "account" \| "help")[]` | Which groups. Default all. |

Always there: "Copy page URL" (`site.copy-url`, mod+shift+c), "Go back" (`site.back`), "Scroll to top" (`site.top`, instant under reduced motion), "Reload page" (`site.reload`) and "Keyboard shortcuts" (`site.shortcuts`, `?`), a page listing every command that has a shortcut, the app's included.

#### Calculator

`evaluate(expression)` and `formatResult(value)` are exported. The grammar: `+ - * / % ^`, unary minus, parentheses, `k` and `m` suffixes (`1.5k`), `pi` and `e`, and `sqrt`, `abs`, `round`, `floor`, `ceil`, `min` and `max`. Anything else, and a result that isn't finite, is `null`. In the palette a bare number or word is a search, not a sum.

#### Accessibility

The input is a `combobox` over a `listbox`; the active row is named by `aria-activedescendant`, so focus never leaves the input. The active row shows an `h1` left edge as well as a tint, the input row's bottom border turns `h1` while it has focus, hint rows ("Searching…", "No matching commands") are disabled options, an argument's error is an always-mounted `role="status"`, group headings aren't uppercase, rows are 36px, and the footer's `<output>` reads the result count and the copy outcome. `bun run play:axe` runs axe-core in Chromium over the open palette's states with contrast on.

### Tables

Since 0.4.0. `Table`, `THead`, `TBody`, `Th` and `Td` give a data table the apps' look: full width, small left-aligned text, muted capitals in the head and a rule above each body row. They are Server Components, and each takes its element's native props, `className` (merged last) and `ref`. Use plain `<tr>` for rows.

```tsx
<Table caption="The pool's maps" hideCaption>
  <THead>
    <tr>
      <Th>Slot</Th>
      <Th numeric>Stars</Th>
    </tr>
  </THead>
  <TBody>
    {slots.map((slot) => (
      <tr key={slot.label}>
        <Th scope="row">{slot.label}</Th>
        <Td numeric>{slot.stars}</Td>
      </tr>
    ))}
  </TBody>
</Table>
```

| Component | Extra props | What it renders |
| --- | --- | --- |
| `Table` | `caption?: ReactNode`, `hideCaption?: boolean` (default `false`), `wrapperClassName?: string`, `scrollLabel?: string` (default `"Table"`) | A `<section>` that scrolls sideways on phones, around the `<table>`. It takes keyboard focus (`tabindex="0"`) so the scroll is reachable without a mouse, and is named by the caption, or by `scrollLabel` without one (since 0.7.0; a plain `<div>` before). `className` and `ref` go on the `<table>`. The caption names the table; `hideCaption` keeps it for screen readers only, when a heading already shows. |
| `THead` | none | A `<thead>` in `c3`, `text-xs`, uppercase. |
| `TBody` | none | A `<tbody>` whose rows get a `b4` top border. Add `[&>tr]:align-top` for rows of mixed height. |
| `Th` | `numeric?: boolean` | A `<th>` with `scope="col"` by default. With `scope="row"` it is a row's heading, in bold `c1`. |
| `Td` | `numeric?: boolean` | A `<td>`. `numeric` lines up digits (`tabular-nums`). |

Cells get `py-2 pr-3`, and the last cell of a row no right padding.

### Utilities

#### `cx`

Since 0.4.0. `cx(...classes: ClassValue[]): string` is the class merger every component uses: it skips falsy values and resolves Tailwind conflicts with tailwind-merge, so a later class wins (`cx("w-full", cond && "w-auto")`). Type: `ClassValue` (`string | false | null | undefined | 0`). It imports tailwind-merge, so a client file that uses it sends tailwind-merge to the browser.

## Accessibility

The target is WCAG 2.2 AA. House rules, which every component follows and your own code around them should too:

- **Focus is always visible, and always the same.** The theme draws a 2px `h1` outline, offset 2px, on `:focus-visible`. Fields keep it (since 0.7.0; before, they swapped it for a 1px border change) and add an `h1` border. `RangeSlider` thumbs show a solid `h1` ring instead and keep a transparent outline, so Windows high contrast mode (forced colors) still paints one. Never `outline: none`.
- **Targets are 24px or more** (WCAG 2.2 2.5.8): buttons are `h-9`, chips and tabs 24px tall, slider thumbs 24px (since 0.7.0), checkboxes and radios 24px and the `Disclosure` and `HeaderMenu` buttons at least 24px tall (since 0.8.0).
- **Contrast is computed, not eyeballed.** The test suite checks `c1` on `h2`, `h1` on `b4` and `b5`, and the hue overrides under Setup; `StarRating` picks its text color by contrast. Text is never dimmed with `opacity` (a `text-c4` line at 70% opacity drops under 4.5:1): use a lighter palette step instead.
- **Color never carries meaning alone.** Accent links are underlined, a pressed `Chip` is `aria-pressed`, the current nav link is `aria-current`, `CharCounter` says "over the limit" in words, errors are text.
- **Live regions exist before they speak.** `CopyButton`, `AsyncButton`, `CharCounter live`, `FilterPanel`'s count and `ReportDisclosure`'s outcome render their `<output>` or `role="status"` node up front, empty, and swap the text in. Field errors are `role="status"` (polite); `Notice live tone="error"` is the one `role="alert"`.
- **Focus never falls to the body.** When the control you pressed goes away, focus moves somewhere sensible: `FilterPanel` to its heading, `Pagination` to "Page X of Y", `InlineConfirm` back to its trigger, `ReportDisclosure` to its outcome line. Pending buttons use `aria-disabled`, not `disabled`, so focus stays.
- **The palette is a combobox.** `CommandPalette` keeps focus on its input and names the active row with `aria-activedescendant`; the row shows its state with an `h1` edge, the input row shows focus, and `bun run play:axe` checks its open states in a real browser (since 0.8.0).
- **Landmarks are few and named.** `PageShell` gives a skip link and `<main>`; `SiteHeader` one `<nav>` (`navLabel`, default "Main"); `SiteFooter` one `<nav>` (`navLabel`, default "Footer") with a headed `<section>` per column; `Pagination` and `LinkTabs` are labelled `<nav>`s. Give two of a kind different labels.
- **Scrollable regions take focus.** `Table`'s wrapper is a focusable named section. Do the same for a `pre` inside `Prose`.
- **Native first.** Fields are native inputs, selects and textareas; radios and checkboxes are native with a visible label; `RangeSlider`'s thumbs are native range inputs with `aria-valuetext` ("10+" reads as it shows); `Disclosure` and `HeaderMenu` are buttons with `aria-expanded` and `aria-controls`; `Tabs` follows the ARIA tabs pattern (one tab in the Tab order, arrows, Home and End, `aria-controls`). ARIA only where HTML has no element.
- **Groups are named.** `ChipGroup`, `RangeSlider`, `RadioGroup` and `FilterRow` are fieldsets named by their label. Inside a `FilterRow`, `hideLabel` leaves the naming to the row, so each row is announced once.
- **Icons are decorative; links and buttons have names.** `DiscordIcon` and `GitHubIcon` are hidden from screen readers; give the link around each one an `aria-label`, as `SiteFooter` does. Give icon-only buttons an `aria-label`, and keep `label` props meaningful. `BeatmapStats` reads "Circle size" where it shows "CS".
- **Tested.** Every component is checked with axe-core's WCAG 2.0, 2.1 and 2.2 A and AA rules in the test suite (color contrast excepted: that needs a real browser). The consumer check then renders every component in a real Next.js app and runs axe in headless Chromium with contrast and target-size checks on, at a desktop and a phone width; the sites run the same pass over their pages. Interactive ones also have keyboard tests.

## Compatibility

| Requirement | Supported |
| --- | --- |
| Next.js | 16 (app router). Components use `next/link` and `next/navigation`. |
| React | 19 |
| Tailwind CSS | 4.1 or later (4.x), through `@tailwindcss/postcss` |
| Node.js | 22.12 or later (`engines`) |
| Module format | ESM only. Plain Node and Vitest can import it (for component tests in your app). |
| Theme | Dark only |

## Changelog and contributing

See [CHANGELOG.md](./CHANGELOG.md) for what changed in each version and [CONTRIBUTING.md](./CONTRIBUTING.md) to work on the package. `bun run play` serves `playground/`, a small Next.js app in the repo that renders the components straight from `src/`, for trying a change by hand. Report security issues as described in [SECURITY.md](./SECURITY.md). Bring questions and feedback to the haruhime.moe [Discord server](https://discord.gg/bKy9kjMV4y).

## License

[MIT](./LICENSE)
