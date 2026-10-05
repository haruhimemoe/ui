/**
 * @file playground/app/maps/page.tsx
 * @desc The map display for play:axe: every MapCard layout x background x density, every state,
 *       a MapSetCard and a MapGroup with empty slots. Covers are local SVGs (white is the
 *       contrast worst case) and the preview clip is a missing local file, so the run needs no
 *       network.
 * @author David @dvhsh (https://dvh.sh)
 * @created Mon Oct 5, 2026
 * @modified Mon Oct 5, 2026
 */

import {
  Button,
  MapCard,
  MapCopyScope,
  MapGroup,
  MapPreviewButton,
  MapSetCard,
  PageHeader,
  PageShell,
} from "@haruhimemoe/ui";

const META = {
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
};
const LAYOUTS = ["row", "card"] as const;
const BACKGROUNDS = ["none", "cover", "blur"] as const;
const DENSITIES = ["comfortable", "compact"] as const;
const COVERS = { white: "/maps/cover-white.svg", art: "/maps/cover-art.svg" };

const preview = (
  <MapPreviewButton beatmapsetId={39804} song="xi - FREEDOM DiVE" src="/maps/no-clip.mp3" />
);

/**
 * @function MapsPage
 * @returns {JSX.Element} every map display variant on one page
 */
export default function MapsPage() {
  return (
    <PageShell>
      <PageHeader title="Map display" lead="Every MapCard variant, a set and a group." />
      <MapCopyScope>
        {LAYOUTS.map((layout) => (
          <section key={layout} aria-label={`${layout} layout`} className="flex flex-col gap-3">
            <h2 className="font-bold text-c1 text-lg">{layout}</h2>
            {BACKGROUNDS.flatMap((background) =>
              DENSITIES.map((density) => (
                <MapCard
                  key={`${background}-${density}`}
                  layout={layout}
                  background={background}
                  density={density}
                  beatmapId={129891}
                  map={META}
                  coverUrl={background === "cover" ? COVERS.white : COVERS.art}
                  slot={{ label: "NM1" }}
                  showStatus
                  copyId
                  titleAs="h3"
                  preview={preview}
                  details={<span className="text-c3 text-xs">{`${background}, ${density}`}</span>}
                  actions={
                    <Button variant="ghost" aria-label="Remove xi - FREEDOM DiVE">
                      Remove
                    </Button>
                  }
                />
              )),
            )}
          </section>
        ))}
        <section aria-label="States" className="flex flex-col gap-3">
          <h2 className="font-bold text-c1 text-lg">States</h2>
          <MapCard beatmapId={4} state="loading" copyId titleAs="h3" />
          <MapCard beatmapId={5} state="missing" copyId titleAs="h3" />
          <MapCard
            beatmapId={6}
            state="error"
            message="The mirror didn't answer. Try again."
            titleAs="h3"
          />
          <MapCard beatmapId={7} titleAs="h3" />
        </section>
        <MapSetCard
          beatmapsetId={39804}
          artist="xi"
          title="FREEDOM DiVE"
          creator="Nakagawa-Kanon"
          status="ranked"
          coverUrl={COVERS.art}
          background="blur"
          preview={preview}
          note="Sample set for the playground."
          difficulties={[
            {
              beatmapId: 129891,
              version: "FOUR DIMENSIONS",
              stars: 7.12,
              stats: { ar: 9, bpm: 222.22 },
            },
            {
              beatmapId: 129892,
              version: "Another",
              stars: 5.4,
              href: null,
              details: "Played in 3 past pools",
            },
          ]}
          copyId
        />
        <MapGroup title="NM" count={1} target={3} detail="Nomod" emptySlots={2}>
          <MapCard
            as="li"
            beatmapId={129891}
            map={META}
            coverUrl={COVERS.art}
            slot={{ label: "NM1" }}
            copyId
          />
        </MapGroup>
      </MapCopyScope>
    </PageShell>
  );
}
