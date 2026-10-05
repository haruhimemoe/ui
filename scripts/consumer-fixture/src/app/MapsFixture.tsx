/**
 * @file scripts/consumer-fixture/src/app/MapsFixture.tsx
 * @desc The 0.16.0 map display, rendered from the Server Component page: a row MapCard with a
 *       slot and Copy ID, a card MapCard over its cover, a MapSetCard, a MapGroup, a MapCover and
 *       a MapPreviewButton. The build proves the server pieces import nothing client-only.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import { Card, MapCard, MapCover, MapGroup, MapPreviewButton, MapSetCard } from "@haruhimemoe/ui";

/** BeatmapMeta-shaped, extra fields included: MapCard must ignore checksum and mode. */
const META = {
  beatmapId: 129891,
  beatmapsetId: 39804,
  artist: "xi",
  title: "FREEDOM DiVE",
  version: "FOUR DIMENSIONS",
  creator: "Nakagawa-Kanon",
  starRating: 7.12,
  cs: 4,
  ar: 9,
  od: 8,
  hp: 6,
  bpm: 222.22,
  lengthSeconds: 263,
  status: "ranked",
  checksum: "da8aae79c8f3306b5d65ec951874a7fb",
  mode: "osu",
};

/**
 * @function MapsFixture
 * @returns {JSX.Element} the map display pieces in one Card
 */
export function MapsFixture() {
  return (
    <Card title="Maps" headingLevel={3}>
      <MapGroup title="NM" count={2} target={3} emptySlots={1} detail="Nomod">
        <MapCard as="li" beatmapId={129891} map={META} slot={{ label: "NM1" }} copyId />
        <MapCard as="li" beatmapId={5} state="loading" slot={{ label: "NM2" }} copyId />
      </MapGroup>
      <MapCard layout="card" background="cover" beatmapId={129891} map={META} titleAs="h4" />
      <MapSetCard
        beatmapsetId={39804}
        artist="xi"
        title="FREEDOM DiVE"
        creator="Nakagawa-Kanon"
        status="ranked"
        difficulties={[{ beatmapId: 129891, version: "FOUR DIMENSIONS", stars: 7.12 }]}
      />
      <div className="size-12">
        <MapPreviewButton beatmapsetId={39804} song="xi - FREEDOM DiVE" />
      </div>
      <MapCover beatmapsetId={39804} className="size-12" />
    </Card>
  );
}
