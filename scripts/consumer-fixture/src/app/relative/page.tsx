import { HeaderOnly } from "../HeaderOnly";

// A relative href: no client list, but its next/link hydrates.
export default function Page() {
  return (
    <HeaderOnly
      links={[
        { label: "Top", href: "#main" },
        { label: "osu!", href: "https://osu.ppy.sh" },
      ]}
    />
  );
}
