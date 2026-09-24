/**
 * @file tests/components/actions/JsonLd.test.tsx
 * @desc Component tests for JsonLd: the script tag, @context, the "<" escape that keeps
 *       "</script>" in the data from closing the tag (in the DOM and in server HTML), native props.
 * @author David @dvhsh (https://dvh.sh)
 * @created Wed Sep 23, 2026
 * @modified Wed Sep 23, 2026
 */

import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JsonLd } from "../../../src/components/actions/JsonLd.js";
import { expectNoAxeViolations } from "../../helpers/axe.js";

const EVIL = "</script><script>alert(1)</script><!--";

describe("JsonLd", () => {
  it("renders a JSON-LD script with the schema.org context", () => {
    const { container } = render(<JsonLd data={{ "@type": "WebSite", name: "packs" }} />);
    const script = container.querySelector("script");
    expect(script).toHaveAttribute("type", "application/ld+json");
    expect(JSON.parse(script?.textContent ?? "")).toEqual({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "packs",
    });
  });

  it("lets the data override @context", () => {
    const { container } = render(<JsonLd data={{ "@context": "https://example.org" }} />);
    const parsed = JSON.parse(container.querySelector("script")?.textContent ?? "");
    expect(parsed["@context"]).toBe("https://example.org");
  });

  it("escapes every '<' so '</script>' in the data can't break out", () => {
    const { container } = render(<JsonLd data={{ name: EVIL }} />);
    const scripts = container.querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    const raw = scripts[0]?.innerHTML ?? "";
    expect(raw).not.toContain("<");
    expect(raw).toContain("\\u003c/script>");
    expect(JSON.parse(raw).name).toBe(EVIL);
  });

  it("keeps the escape in server-rendered HTML", () => {
    const html = renderToStaticMarkup(<JsonLd data={{ name: EVIL, nested: { list: [EVIL] } }} />);
    expect(html.match(/<\/script/g)).toHaveLength(1);
    expect(html.endsWith("</script>")).toBe(true);
    expect(html).not.toContain("<!--");
  });

  it("passes native script props like id and nonce through, but not a different type", () => {
    const { container } = render(<JsonLd id="ld" nonce="abc" data={{ "@type": "Thing" }} />);
    const script = container.querySelector("script");
    expect(script).toHaveAttribute("id", "ld");
    expect(script).toHaveAttribute("type", "application/ld+json");
  });

  it("has no axe violations", async () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: EVIL }} />);
    await expectNoAxeViolations(container);
  });
});
