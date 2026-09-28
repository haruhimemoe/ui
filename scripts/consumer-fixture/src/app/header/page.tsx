import { HeaderOnly } from "../HeaderOnly";

// A link to this page, so the nav's client list marks it.
export default function Page() {
  return (
    <HeaderOnly
      links={[
        { label: "Header", href: "/header" },
        { label: "osu!", href: "https://osu.ppy.sh" },
      ]}
    />
  );
}
