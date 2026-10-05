/**
 * @file tests/components/mdx/Glossary.test.tsx
 * @desc Glossary and Term: entry ids and aliases' own anchors, and a Term linking to its entry by
 *       an explicit term, its own text, or a given href.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Glossary } from "../../../src/components/mdx/Glossary.js";
import { Term } from "../../../src/components/mdx/Term.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

describe("Glossary and Term", () => {
  it("renders dt ids, dfn terms, aliases and their anchors", async () => {
    const { container } = render(
      <Glossary
        entries={[
          { term: "FM", definition: "Freemod: pick your own mods.", aliases: ["Freemod"] },
          { term: "Tiebreaker", definition: "The last map." },
        ]}
      />,
    );
    const dt = container.querySelector("dt#term-fm");
    expect(dt?.querySelector("dfn")?.textContent).toBe("FM");
    expect(screen.getByText("(Freemod)")).toBeInTheDocument();
    expect(container.querySelector("#term-freemod")).not.toBeNull();
    expect(container.querySelector("dt#term-tiebreaker")).not.toBeNull();
    await expectNoAxeViolations(container);
  });

  it("links a Term to its glossary entry by term, by text, or to an href", () => {
    render(
      <p>
        <Term term="FM">freemod</Term> <Term>Tiebreaker</Term>{" "}
        <Term href="/guides/glossary#term-tb">TB</Term>
      </p>,
    );
    expect(screen.getByRole("link", { name: "freemod" })).toHaveAttribute("href", "#term-fm");
    expect(screen.getByRole("link", { name: "Tiebreaker" })).toHaveAttribute(
      "href",
      "#term-tiebreaker",
    );
    expect(screen.getByRole("link", { name: "TB" })).toHaveAttribute(
      "href",
      "/guides/glossary#term-tb",
    );
    expect(screen.getByRole("link", { name: "freemod" })).toHaveClass("decoration-dotted");
  });
});
