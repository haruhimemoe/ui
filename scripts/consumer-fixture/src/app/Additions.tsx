import {
  Badge,
  BeatmapStats,
  Card,
  cx,
  HARUHIME_TOOLS,
  haruhimeToolsColumn,
  LinkTabs,
  linkClasses,
  ModBadge,
  StarRating,
  Table,
  TBody,
  Td,
  TextLink,
  THead,
  Th,
} from "@haruhimemoe/ui";

// The 0.4.0 server components, rendered straight from the Server Component page.
export function Additions() {
  return (
    <Card title="Additions" headingLevel={3}>
      <p className={cx("text-c2", false)}>
        Read <TextLink href="/docs">the docs</TextLink> or{" "}
        <TextLink href="https://osu.ppy.sh" target="_blank" variant="plain">
          osu!
        </TextLink>
        . <Badge tone="warning">Unranked</Badge> <Badge tone="muted">beta</Badge>
      </p>
      <button type="button" className={linkClasses({ className: "py-1" })}>
        Looks like a link
      </button>
      <LinkTabs
        label="What to search"
        items={[
          { href: "/", label: "Pools", current: true },
          { href: "/docs", label: "Maps" },
        ]}
      />
      <p>
        {HARUHIME_TOOLS.length} tools; footer column {haruhimeToolsColumn({ current: "bb" }).title}
      </p>
      <StarRating value={5.23} label="with HR" />
      <BeatmapStats cs={4} ar={9.3} od={8} hp={5} bpm={180} lengthSeconds={125} />
      <ModBadge mod="HD2" />
      <Table caption="Slots" hideCaption>
        <THead>
          <tr>
            <Th>Slot</Th>
            <Th numeric>Stars</Th>
          </tr>
        </THead>
        <TBody>
          <tr>
            <Th scope="row">NM1</Th>
            <Td numeric>5.23</Td>
          </tr>
        </TBody>
      </Table>
    </Card>
  );
}
