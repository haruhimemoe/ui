/**
 * @file playground/app/surfaces/page.tsx
 * @desc Every 0.13.0 layout piece, for play:axe.
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
  PageHeader,
  PageShell,
  PrevNext,
  Progress,
  SectionHeading,
  StatList,
  Surface,
} from "@haruhimemoe/ui";
import { SurfacesClient } from "@/components/SurfacesClient";

export default function SurfacesPage() {
  return (
    <PageShell>
      <PageHeader title="Surfaces" lead="Every 0.13.0 layout piece, for play:axe." />
      <SectionHeading id="cards" anchor detail="(3)" actions={<a href="/">Home</a>}>
        Cards
      </SectionHeading>
      <CardGrid columns={3}>
        <LinkCard
          title="packs"
          href="https://packs.haruhime.moe"
          media={<div aria-hidden="true" className="h-16 bg-h2" />}
        >
          <p>Build an osu! beatmap pack from a mappool.</p>
          <LinkRow
            items={[
              { href: "https://github.com/haruhimemoe", label: "GitHub" },
              { href: "/mdx", label: "MDX" },
            ]}
          />
          <CodeChip code="bun add @haruhimemoe/ui" />
        </LinkCard>
        <Surface padding="lg">A plain surface.</Surface>
        <div className="relative rounded-[10px] bg-b4 p-5">
          <CardLink href="/second" className="after:rounded-[10px]">
            A relative box made a card
          </CardLink>
        </div>
      </CardGrid>
      <StatList
        items={[
          { label: "Version", value: "0.13.0" },
          { label: "Stars", value: "7" },
        ]}
      />
      <StatList
        variant="tiles"
        items={[
          { label: "Maps", value: "12" },
          { label: "BPM", value: "180" },
        ]}
      />
      <StatList
        variant="grid"
        items={[
          { label: "CS", value: "4" },
          { label: "AR", value: "9.3" },
          { label: "OD", value: "8" },
          { label: "HP", value: "5" },
        ]}
      />
      <LinkRow
        label="Changelog filter"
        variant="quiet"
        items={[
          { href: "/", label: "All" },
          { href: "/surfaces", label: "Packages", current: true },
        ]}
      />
      <EmptyState title="No maps yet">Add a map to start the pool.</EmptyState>
      <EmptyState variant="filled" size="sm">
        No packs yet.
      </EmptyState>
      <Progress label="Nothing yet" value={0} max={12} status="0 of 12 sets ready" />
      <Progress label="Download progress" value={5} max={12} status="5 of 12 sets ready" />
      <Progress label="Loading" hideLabel />
      <SurfacesClient />
      <PrevNext
        label="More pages"
        prev={{ href: "/", title: "Command palette" }}
        next={{ href: "/mdx", title: "MDX components" }}
      />
    </PageShell>
  );
}
