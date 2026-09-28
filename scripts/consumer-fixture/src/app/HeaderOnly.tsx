import { SiteHeader, type SiteLinkItem } from "@haruhimemoe/ui";

// A page with nothing but the header, so its scripts are the header's own.
export function HeaderOnly({ links }: { links: SiteLinkItem[] }) {
  return <SiteHeader brand={<a href="/">consumer</a>} links={links} />;
}
