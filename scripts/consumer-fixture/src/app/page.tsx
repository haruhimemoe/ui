import {
  BrandPage,
  BrandSwatch,
  Button,
  ButtonLink,
  buttonClasses,
  Card,
  Checkbox,
  Chip,
  ContentIndex,
  ContentLayout,
  ContentNav,
  ContentPage,
  ContentSearch,
  CopyButton,
  CopyMarkdownButton,
  DiscordIcon,
  FilterPanel,
  FilterRow,
  fieldClasses,
  GitHubIcon,
  HaruhimeWordmark,
  HaruhimeWordmarkLink,
  JsonLd,
  moveItem,
  NavLinks,
  Notice,
  PageHeader,
  PageShell,
  Pagination,
  Prose,
  Select,
  SiteFooter,
  type SiteFooterColumn,
  SiteHeader,
  type SiteLinkItem,
  SORTABLE_CONTAINER,
  SORTABLE_ITEM,
  searchContent,
  Textarea,
  TextInput,
} from "@haruhimemoe/ui";
import Link from "next/link";
import { Additions } from "./Additions";
import { ClientAdditions } from "./ClientAdditions";
import { ClientAdditions05 } from "./ClientAdditions05";
import { ClientDialogs } from "./ClientDialogs";
import { ClientSurfaces } from "./ClientSurfaces";
import { Filters } from "./Filters";
import { Foundations } from "./Foundations";
import { MapsClientFixture } from "./MapsClientFixture";
import { MapsFixture } from "./MapsFixture";
import { MdxExports } from "./MdxExports";
import { Palette08 } from "./Palette08";
import { Sortable15 } from "./Sortable15";
import { Surfaces } from "./Surfaces";

const LINKS: SiteLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Docs", href: "/docs" },
  { label: "osu!", href: "https://osu.ppy.sh" },
  { label: "Sheets", note: "soon" },
];

// No path in the app, so NavLinks renders these on the server with no client list.
const OFFSITE: SiteLinkItem[] = [
  { label: "osu! wiki", href: "https://osu.ppy.sh/wiki" },
  { label: "Sheets", note: "soon" },
];

const COLUMNS: SiteFooterColumn[] = [
  {
    title: "Site",
    items: [
      { label: "Home", href: "/" },
      { label: "Sheets", note: "soon" },
    ],
  },
  { title: "Elsewhere", items: [{ label: "osu!", href: "https://osu.ppy.sh" }] },
];

export default function Page() {
  return (
    <PageShell
      header={
        <SiteHeader
          brand={<Link href="/">consumer</Link>}
          links={LINKS}
          actions={<Button variant="ghost">Sign in</Button>}
        />
      }
      footer={
        <SiteFooter
          columns={COLUMNS}
          tools={{ current: "packs" }}
          finePrint="Not affiliated with osu!."
          discordHref="https://discord.gg/example"
        />
      }
    >
      <JsonLd data={{ "@type": "WebSite", name: "consumer" }} />
      <PageHeader
        title="Consumer check"
        lead="Every component, from the packed tarball."
        meta="From the packed tarball."
        actions={<ButtonLink href="/docs">Docs</ButtonLink>}
      />
      <nav aria-label="Secondary">
        <NavLinks links={LINKS} align="center" />
      </nav>
      <nav aria-label="Elsewhere">
        <NavLinks links={OFFSITE} />
      </nav>
      <Card title="Basics">
        <Button>Primary</Button>
        <ButtonLink href="https://osu.ppy.sh" variant="secondary" target="_blank">
          osu!
        </ButtonLink>
        <a href="/plain" className={buttonClasses({ variant: "ghost", size: "lg" })}>
          Plain link
        </a>
        <Notice tone="warning" live>
          Heads up.
        </Notice>
        <Prose>
          <h2>Prose</h2>
          <p>
            Text with <code>code</code>.
          </p>
        </Prose>
      </Card>
      <Card title="Forms">
        <TextInput id="name" label="Name" hint="Shown on the pack." defaultValue="" />
        <Textarea id="notes" label="Notes" error="Too long." />
        <Select id="mode" label="Mode" defaultValue="osu">
          <option value="osu">osu!</option>
          <option value="taiko">osu!taiko</option>
        </Select>
        <Checkbox id="video" label="Include video" hint="Bigger download" defaultChecked />
        <select aria-label="Move to" className={fieldClasses("w-auto")}>
          <option>Top</option>
        </select>
      </Card>
      <Card title="Actions">
        <CopyButton text="https://example.com" label="Copy link" />
        <Pagination page={2} pageCount={3} hrefFor={(page) => `/?page=${page}`} />
        <Chip pressed>HD</Chip>
        <DiscordIcon />
        <GitHubIcon />
        <HaruhimeWordmark />
        <HaruhimeWordmarkLink />
        <Palette08 />
      </Card>
      <Additions />
      <MapsFixture />
      <MapsClientFixture />
      <ClientAdditions />
      <ClientAdditions05 />
      <Sortable15 />
      <ol aria-label="Server sortable classes" className={SORTABLE_CONTAINER}>
        <li className={SORTABLE_ITEM}>{moveItem(["second", "first"], 1, 0).join(" then ")}</li>
      </ol>
      <ClientDialogs />
      <Filters />
      <Foundations />
      <MdxExports />
      <Surfaces />
      <ClientSurfaces />
      <ContentLayout
        nav={
          <ContentNav
            label="Docs"
            indexHref="/"
            groups={[
              {
                heading: "Guides",
                items: [
                  { href: "/docs", title: "Getting started", navTitle: "Start" },
                  { href: "/relative", title: "Relative links", badge: "new" },
                ],
              },
            ]}
          />
        }
      >
        <p>Content layout body, from the packed tarball.</p>
      </ContentLayout>
      <ContentSearch
        label="Search the docs"
        items={[
          { href: "/docs", title: "Getting started", description: "From the packed tarball." },
          { href: "/relative", title: "Relative links", badge: "new", description: "Links." },
        ]}
      />
      <ContentIndex
        items={searchContent(
          [{ href: "/legal/terms", title: "Terms", description: "From the packed tarball." }],
          "",
        )}
      />
      <ContentPage
        title="Content page"
        description="Everything a doc page needs, from the packed tarball."
        lastUpdated="2026-10-04"
        markdownHref="/docs/guide.md"
        jsonLd={{ "@type": "TechArticle", name: "Content page" }}
        actions={<ButtonLink href="/docs">Edit on GitHub</ButtonLink>}
      >
        <h2>Body</h2>
        <p>From ContentPage&apos;s Prose wrapper.</p>
      </ContentPage>
      <CopyMarkdownButton href="/docs/guide.md" label="Copy raw markdown" />
      <BrandPage
        name="pools"
        mark="po"
        tagline="From the packed tarball."
        url="https://pools.haruhime.moe"
        writing="Write pools in lowercase."
        dos={["Link to the site"]}
        donts={["Recolor the icon"]}
        palette={{ h1: "#ff66ab", b6: "#1a1d22" }}
        assets={[{ label: "Palette (JSON)", href: "/brand/pools-palette.json", dark: true }]}
        contact="haruhime@haruhime.moe"
        familyHref="https://haruhime.moe/brand"
      />
      <BrandSwatch token="h2" hex="#66ccff" />
      <FilterPanel title="Server filters" resultCount="3 maps">
        <FilterRow label="Mode">
          <Chip pressed={false}>osu!taiko</Chip>
        </FilterRow>
      </FilterPanel>
    </PageShell>
  );
}
