/**
 * @file scripts/consumer-fixture/src/app/Surfaces.tsx
 * @desc The 0.13.0 Server Components, rendered straight from the Server Component page.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import {
  CardGrid,
  CardLink,
  CodeChip,
  EmptyState,
  LinkCard,
  LinkRow,
  PrevNext,
  Progress,
  SectionHeading,
  StatList,
  Surface,
  surfaceClasses,
} from "@haruhimemoe/ui";

// The 0.13.0 server components, rendered straight from the Server Component page.
export function Surfaces() {
  return (
    <section aria-label="Surfaces" className="flex flex-col gap-4">
      <SectionHeading id="recent-packs" anchor detail="(2)" actions={<a href="/docs">See all</a>}>
        Recent packs
      </SectionHeading>
      <ul className="flex flex-col gap-2">
        <Surface as="li">Surface item</Surface>
      </ul>
      <a href="/docs" className={surfaceClasses({ className: "block hover:bg-b3" })}>
        Surface link
      </a>
      <CardGrid columns={3}>
        <LinkCard
          title="packs"
          href="/docs"
          media={<div aria-hidden="true" className="h-12 bg-h2" />}
        >
          <p>From the packed tarball.</p>
          <LinkRow items={[{ href: "https://osu.ppy.sh/wiki", label: "osu! wiki" }]} />
          <CodeChip code="bun add @haruhimemoe/ui" />
        </LinkCard>
        <div className="relative rounded-[10px] bg-b4 p-5">
          <CardLink href="/relative">Card link alone</CardLink>
        </div>
      </CardGrid>
      <StatList
        variant="tiles"
        items={[
          { label: "Maps", value: "12" },
          { label: "BPM", value: "180" },
        ]}
      />
      <StatList variant="grid" columns={2} items={[{ label: "Length", value: "2:05" }]} />
      <StatList items={[{ label: "Stars", value: "7" }]} />
      <EmptyState title="Nothing here">No maps yet.</EmptyState>
      <EmptyState variant="filled" size="sm">
        No packs yet.
      </EmptyState>
      <Progress label="Download progress" value={0.5} status="6 of 12 sets ready" />
      <Progress label="Loading" hideLabel />
      <LinkRow
        label="Changelog filter"
        variant="quiet"
        items={[
          { href: "/docs", label: "All" },
          { href: "/relative", label: "Packages", current: true },
        ]}
      />
      <PrevNext
        label="More guides"
        prev={{ href: "/docs", title: "Getting started" }}
        next={{ href: "/relative", title: "Relative links" }}
      />
    </section>
  );
}
