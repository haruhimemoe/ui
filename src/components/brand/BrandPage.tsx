/**
 * @file src/components/brand/BrandPage.tsx
 * @desc A product's `/brand` page body: name, logo files, colors, type, do's and don'ts, the
 *       osu! line, the family link and the contact, each a `Card`. Takes plain data shaped like
 *       `@haruhimemoe/brand`'s `brandPageData(...)` output (typed structurally here; ui doesn't
 *       depend on brand), so an app writes `<BrandPage {...brandPageData("pools")} />`. A Server
 *       Component; only `BrandSwatch` hydrates.
 * @author David @dvhsh (https://dvh.sh)
 * @created Sun Oct 4, 2026
 * @modified Sun Oct 4, 2026
 */

import type { ReactNode } from "react";
import { Card } from "../basics/Card.js";
import { linkClasses } from "../basics/linkStyles.js";
import { TextLink } from "../basics/TextLink.js";
import { BrandSwatch } from "./BrandSwatch.js";

/** One downloadable brand file. */
export type BrandPageAsset = {
  /** The link's text. */
  label: string;
  /** The file's URL. */
  href: string;
  /** True for a file drawn for a dark background, false for its on-light variant. */
  dark: boolean;
};

/** One typeface and what it's used for. */
export type BrandPageFont = { name: string; usage: string };

/** `BrandPage`'s props: `brandPageData(...)`'s shape, plus optional fonts and slots. */
export type BrandPageProps = {
  name: string;
  mark: string;
  tagline: string;
  url: string;
  /** How to write the name in running text. */
  writing: string;
  dos: readonly string[];
  donts: readonly string[];
  /** Token to `"#rrggbb"`. */
  palette: Record<string, string>;
  assets: readonly BrandPageAsset[];
  /** The contact address, linked with `mailto:`. */
  contact: string;
  /** The family brand page; null hides the Family section. */
  familyHref: string | null;
  /** Defaults to Nunito for wordmarks and headings. */
  fonts?: readonly BrandPageFont[] | undefined;
  /** Extra sections after Logo, after Colors, and at the end. */
  slots?: { afterLogo?: ReactNode; afterColors?: ReactNode; end?: ReactNode } | undefined;
};

const DEFAULT_FONTS: readonly BrandPageFont[] = [
  { name: "Nunito", usage: "Wordmarks and headings" },
];

const LINK = linkClasses();
const IMAGE = /\.(svg|png|jpe?g|webp)$/i;

/**
 * @function BrandPage
 * @param props {BrandPageProps} the product's brand data, optional fonts and slots
 * @returns {JSX.Element} the brand page's sections, in order
 */
export function BrandPage({
  name,
  tagline,
  url,
  writing,
  dos,
  donts,
  palette,
  assets,
  contact,
  familyHref,
  fonts = DEFAULT_FONTS,
  slots,
}: BrandPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card title="Name">
        <p className="font-bold text-c1 text-xl">{name}</p>
        <p>{tagline}</p>
        <p>{writing}</p>
        <p>
          <a className={LINK} href={url}>
            {url}
          </a>
        </p>
      </Card>
      <Card title="Logo">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {assets.map((asset) => (
            <li key={asset.href} className="flex flex-col gap-2">
              {IMAGE.test(asset.href) ? (
                <div
                  className={`flex h-32 items-center justify-center rounded-md p-4 ${asset.dark ? "bg-b6" : "bg-c1"}`}
                >
                  {/* Decorative: the download link right below already carries the file's name. */}
                  {/* biome-ignore lint/performance/noImgElement: unsized SVG previews; next/image needs a size */}
                  <img src={asset.href} alt="" className="max-h-full max-w-full" />
                </div>
              ) : null}
              <TextLink href={asset.href} download>
                {asset.label}
              </TextLink>
            </li>
          ))}
        </ul>
      </Card>
      {slots?.afterLogo}
      <Card title="Colors">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(palette).map(([token, hex]) => (
            <li key={token}>
              <BrandSwatch token={token} hex={hex} />
            </li>
          ))}
        </ul>
      </Card>
      {slots?.afterColors}
      <Card title="Type">
        <ul className="flex flex-col gap-1">
          {fonts.map((font) => (
            <li key={font.name}>
              <span className="font-bold text-c1">{font.name}</span>: {font.usage}
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Do's and don'ts">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h3 className="mb-1 font-bold text-c1">Do</h3>
            <ul className="list-disc pl-5">
              {dos.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-1 font-bold text-c1">Don't</h3>
            <ul className="list-disc pl-5">
              {donts.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
      <Card title="osu!">
        <p>Not affiliated with osu! or ppy. osu! is a trademark of ppy Pty Ltd.</p>
      </Card>
      {familyHref ? (
        <Card title="Family">
          <a className={LINK} href={familyHref}>
            Part of the haruhime.moe family.
          </a>
        </Card>
      ) : null}
      <Card title="Contact">
        <a className={LINK} href={`mailto:${contact}`}>
          {contact}
        </a>
      </Card>
      {slots?.end}
    </div>
  );
}
