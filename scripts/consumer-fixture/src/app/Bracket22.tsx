/**
 * @file scripts/consumer-fixture/src/app/Bracket22.tsx
 * @desc 0.22.0 bracket exports from a Server Component: BracketView, BracketMatchCard, and the
 *       pure bracketColumns and sideLabel.
 * @author David @dvhsh (https://dvh.sh)
 * @created Thu Oct 8, 2026
 * @modified Thu Oct 8, 2026
 */

import {
  type BracketLike,
  BracketMatchCard,
  BracketView,
  bracketColumns,
  sideLabel,
} from "@haruhimemoe/ui";

const BRACKET: BracketLike = {
  format: "single",
  rounds: [{ code: "F", name: "Final", side: "winners", order: 0 }],
  matches: [
    {
      code: "M1",
      round: "F",
      a: { entrant: "t1", settled: true, source: { kind: "seed", seed: 1 } },
      b: { entrant: null, settled: false, source: { kind: "winner", match: "M0" } },
      status: "pending",
      scoreA: null,
      scoreB: null,
      winner: null,
    },
  ],
};

export function Bracket22() {
  const [match] = BRACKET.matches;
  return (
    <section>
      <p>
        {bracketColumns(BRACKET).length} block, {sideLabel({ kind: "seed", seed: 2 })}
      </p>
      <BracketView bracket={BRACKET} names={{ t1: "One" }} href={(code) => `/m/${code}`} />
      {match ? <BracketMatchCard match={match} names={{ t1: "One" }} /> : null}
    </section>
  );
}
