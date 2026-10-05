/**
 * @file playground/app/mdx/article/page.tsx
 * @desc A sample article on ContentPage, built by hand through mdxComponents (the playground has
 *       no MDX compiler): a byline, published/updated dates, reading time, a toc, every new 0.17.0
 *       element (h2-h4, a task list, kbd, details, figures, embeds, a footnote, a dl) and every new
 *       article component (Steps, Schedule, Glossary/Term, MdxLinkCard, MapGroup/MapCard), with a
 *       footer linking back to /mdx and to the palette. `bun run play:axe` checks it at two widths,
 *       the toc reached and a video facade clicked.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import {
  ContentPage,
  MapCard,
  MapGroup,
  PageShell,
  PrevNext,
  Toc,
  type TocItem,
} from "@haruhimemoe/ui";
import {
  Embed,
  Figure,
  Glossary,
  Kbd,
  MdxLinkCard,
  mdxComponents,
  Schedule,
  Steps,
  Term,
} from "@haruhimemoe/ui/mdx";

const TOC: TocItem[] = [
  { id: "staffing", text: "Staffing", depth: 2 },
  { id: "referees", text: "Referees", depth: 3 },
  { id: "rolls", text: "Rolls", depth: 4 },
  { id: "schedule", text: "Schedule", depth: 2 },
  { id: "words", text: "Words", depth: 2 },
];

const MAP = {
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

/**
 * @function ArticlePage
 * @returns {JSX.Element} the sample post on ContentPage, through mdxComponents by hand
 */
export default function ArticlePage() {
  const { h2: H2, h3: H3, h4: H4, details: Details, input: Checkbox, img: Img } = mdxComponents;
  return (
    <PageShell>
      <ContentPage
        title="Running qualifiers"
        description="How we staff, schedule and seed a qualifier split."
        authors={[{ name: "David", userId: 2 }, { name: "Ref" }]}
        published="2026-10-01"
        lastUpdated="2026-10-04"
        readingMinutes={6}
        toc={<Toc maxDepth={4} items={TOC} />}
        footer={
          <PrevNext
            label="More posts"
            prev={{ href: "/mdx", title: "MDX components" }}
            next={{ href: "/", title: "Palette" }}
          />
        }
      >
        <H2 id="staffing">Staffing</H2>
        <Steps>
          <ol>
            <li>Post the staffing call in the tournament's Discord.</li>
            <li>Collect role sign-ups for two weeks.</li>
            <li>Confirm each referee's availability for the qualifier window.</li>
          </ol>
        </Steps>
        <H3 id="referees">Referees</H3>
        <ul className="contains-task-list">
          <li className="task-list-item">
            <Checkbox type="checkbox" checked readOnly /> Confirm referee roster
          </li>
          <li className="task-list-item">
            <Checkbox type="checkbox" readOnly /> Assign backup referees
          </li>
        </ul>
        <H4 id="rolls">Rolls</H4>
        <p>
          Press <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> to open the roll tool during a tiebreaker.
        </p>
        <Details>
          <summary>More about rolls</summary>
          <p>A roll of 100 or higher wins the map pick; ties reroll once.</p>
        </Details>
        <H2 id="schedule">Schedule</H2>
        <Schedule
          items={[
            { when: "Oct 1", dateTime: "2026-10-01", label: "Signups open" },
            { when: "Oct 5", dateTime: "2026-10-05", label: "Seeding posted" },
            { when: "Week 1", label: "Pool released" },
            { when: "Week 2", label: "Qualifiers run" },
          ]}
        />
        <H2 id="words">Words</H2>
        <Glossary
          entries={[
            { term: "FM", definition: "Free mod: any single mod allowed.", aliases: ["Freemod"] },
            { term: "TB", definition: "Tiebreaker: played only when scores are level." },
          ]}
        />
        <p>
          Most lobbies run at least one <Term term="FM">freemod</Term> pick before the{" "}
          <Term term="TB">TB</Term>.
        </p>
        <dl className="mt-4">
          <dt>Mapper</dt>
          <dd>Who made the beatmap.</dd>
          <dt>Host</dt>
          <dd>Who runs the tournament.</dd>
        </dl>
        <Figure
          src="/sample.svg"
          alt="Qualifier lobby"
          width={400}
          height={200}
          caption="The qualifier lobby, mid-round."
          credit="Credit: Haruhime staff"
        />
        <figure>
          <Img src="/sample.svg" alt="Bracket overview" />
          <figcaption>Bracket overview</figcaption>
        </figure>
        <MdxLinkCard
          href="https://osu.ppy.sh/wiki"
          title="osu! wiki"
          description="Rules, mods and scoring reference."
        />
        <MdxLinkCard
          href="/mdx"
          title="MDX components"
          description="The full component gallery."
          source="This site"
        />
        <Embed url="https://youtu.be/dQw4w9WgXcQ" />
        <Embed url="https://www.twitch.tv/videos/2245123456" />
        <p>
          Qualifier seeding follows last split's results
          <sup>
            <a
              href="#user-content-fn-1"
              id="user-content-fnref-1"
              data-footnote-ref
              aria-describedby="footnote-label"
            >
              1
            </a>
          </sup>
          .
        </p>
        <section data-footnotes className="footnotes">
          <H2 id="footnote-label" className="sr-only">
            Footnotes
          </H2>
          <ol>
            <li id="user-content-fn-1">
              <p>
                Results from the last qualifier split.{" "}
                <a
                  href="#user-content-fnref-1"
                  data-footnote-backref
                  aria-label="Back to reference 1"
                >
                  ↩
                </a>
              </p>
            </li>
          </ol>
        </section>
        <MapGroup title="NM" count={1}>
          <MapCard
            as="li"
            beatmapId={129891}
            map={MAP}
            coverUrl="/maps/cover-art.svg"
            slot={{ label: "NM1" }}
          />
        </MapGroup>
      </ContentPage>
    </PageShell>
  );
}
