import {
  Button,
  ButtonLink,
  buttonClasses,
  Card,
  Checkbox,
  Chip,
  CopyButton,
  DiscordIcon,
  FilterPanel,
  FilterRow,
  fieldClasses,
  GitHubIcon,
  HaruhimeWordmark,
  HaruhimeWordmarkLink,
  JsonLd,
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
  Textarea,
  TextInput,
} from "@haruhimemoe/ui";
import Link from "next/link";
import { Additions } from "./Additions";
import { ClientAdditions } from "./ClientAdditions";
import { ClientAdditions05 } from "./ClientAdditions05";
import { Filters } from "./Filters";
import { Palette08 } from "./Palette08";

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
      <ClientAdditions />
      <ClientAdditions05 />
      <Filters />
      <FilterPanel title="Server filters" resultCount="3 maps">
        <FilterRow label="Mode">
          <Chip pressed={false}>osu!taiko</Chip>
        </FilterRow>
      </FilterPanel>
    </PageShell>
  );
}
