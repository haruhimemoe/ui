import { CodeChip } from "@haruhimemoe/ui";

// A page with nothing but a CodeChip, so its scripts are CodeChip's own.
export default function Page() {
  return (
    <main>
      <CodeChip code="bun add @haruhimemoe/ui" />
    </main>
  );
}
