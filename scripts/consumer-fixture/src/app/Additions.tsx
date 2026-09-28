import {
  Badge,
  Card,
  cx,
  linkClasses,
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
    <Card title="Additions" headingLevel={5}>
      <p className={cx("text-c2", false)}>
        Read <TextLink href="/docs">the docs</TextLink> or{" "}
        <TextLink href="https://osu.ppy.sh" target="_blank" variant="plain">
          osu!
        </TextLink>
        . <Badge tone="warning">Unranked</Badge> <Badge tone="muted">beta</Badge>
      </p>
      <button type="button" className={linkClasses()}>
        Looks like a link
      </button>
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
