import {
  Card,
  CommandPaletteButton,
  PageHeader,
  PageShell,
  Prose,
  SiteFooter,
  SiteHeader,
} from "@haruhimemoe/ui";
import Link from "next/link";
import { HuePicker } from "@/components/HuePicker";
import { Palette } from "@/components/Palette";

export default function Page() {
  return (
    <PageShell
      header={
        <SiteHeader
          brand={<Link href="/">ui playground</Link>}
          links={[
            { label: "Home", href: "/" },
            { label: "Second", href: "/second" },
            { label: "MDX", href: "/mdx" },
            { label: "Dialogs", href: "/dialogs" },
            { label: "Surfaces", href: "/surfaces" },
          ]}
          actions={<CommandPaletteButton>Search</CommandPaletteButton>}
        />
      }
      footer={<SiteFooter columns={[]} tools={{ current: "pools" }} finePrint="Playground." />}
    >
      <Palette />
      <PageHeader
        title="Command palette"
        lead="Press Ctrl K (⌘K on a Mac), or the Search button. Try g b, g h, ?, mod+shift+c, and 2*21."
      />
      <Card title="Try">
        <Prose>
          <ul>
            <li>
              Type "beat" then pick "Search beatmaps…" for the async provider (400 ms, aborts logged
              in the console).
            </li>
            <li>"Jump to beatmap…" collects a number and a choice before running.</li>
            <li>"Pick a mod…" is a nested page; Backspace on an empty input goes back.</li>
            <li>Run a few commands, reopen: the Recent group appears.</li>
          </ul>
        </Prose>
        <HuePicker />
      </Card>
      <Card title="Scroll filler">
        <p className="h-[150vh] text-c4">Scroll down, then open the palette: the page stays put.</p>
      </Card>
    </PageShell>
  );
}
