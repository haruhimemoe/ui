import { HeaderOnly } from "../HeaderOnly";

// Only external and text-only links: nothing in the nav hydrates.
export default function Page() {
  return (
    <HeaderOnly
      links={[
        { label: "osu!", href: "https://osu.ppy.sh" },
        { label: "Sheets", note: "soon" },
      ]}
    />
  );
}
