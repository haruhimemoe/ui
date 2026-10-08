/**
 * @file playground/app/bracket/page.tsx
 * @desc BracketView on a 4-team double elimination bracket with a reset: a played match, a bye,
 *       sides still waiting on earlier matches, a 128-character name with emoji and HTML, and a
 *       highlighted team. Check it at 360px wide: only the bracket scrolls.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Oct 8, 2026
 * @modified Thu Oct 8, 2026
 */

import { type BracketLike, BracketView, PageHeader, PageShell } from "@haruhimemoe/ui";

const seed = (n: number, entrant: string | null) => ({
  entrant,
  settled: true,
  source: { kind: "seed" as const, seed: n },
});
const from = (kind: "winner" | "loser", match: string) => ({
  entrant: null,
  settled: false,
  source: { kind, match },
});
const open = { status: "pending", scoreA: null, scoreB: null, winner: null };

const BRACKET: BracketLike = {
  format: "double",
  rounds: [
    { code: "WSF", name: "Winners semifinal", side: "winners", order: 0 },
    { code: "WF", name: "Winners final", side: "winners", order: 1 },
    { code: "LR1", name: "Losers round 1", side: "losers", order: 2 },
    { code: "LF", name: "Losers final", side: "losers", order: 3 },
    { code: "GF", name: "Grand final", side: "grand", order: 4 },
    { code: "GF2", name: "Reset", side: "grand", order: 5 },
  ],
  matches: [
    {
      code: "M1",
      round: "WSF",
      a: seed(1, "t1"),
      b: seed(4, "t4"),
      status: "done",
      scoreA: 5,
      scoreB: 3,
      winner: "a",
    },
    {
      code: "M2",
      round: "WSF",
      a: seed(2, "t2"),
      b: seed(3, null),
      status: "bye",
      scoreA: null,
      scoreB: null,
      winner: "a",
    },
    {
      code: "M3",
      round: "WF",
      a: { ...from("winner", "M1"), entrant: "t1", settled: true },
      b: { ...from("winner", "M2"), entrant: "t2", settled: true },
      ...open,
    },
    {
      code: "M4",
      round: "LR1",
      a: { ...from("loser", "M1"), entrant: "t4", settled: true },
      b: { ...from("loser", "M2"), settled: true },
      ...open,
    },
    { code: "M5", round: "LF", a: from("winner", "M4"), b: from("loser", "M3"), ...open },
    { code: "M6", round: "GF", a: from("winner", "M3"), b: from("winner", "M5"), ...open },
    { code: "M7", round: "GF2", a: from("winner", "M6"), b: from("loser", "M6"), ...open },
  ],
};

const NAMES = {
  t1: "Haruhi 🌸",
  t2: `<b>not bold</b> ${"🎵 a very long team name ".repeat(5)}`.slice(0, 128),
  t4: "Kyon",
};

export default function Page() {
  return (
    <PageShell>
      <PageHeader title="Bracket" lead="Double elimination with a reset. Kyon is highlighted." />
      <BracketView bracket={BRACKET} names={NAMES} href={(code) => `#${code}`} highlight="t4" />
    </PageShell>
  );
}
