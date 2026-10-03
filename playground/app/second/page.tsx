import { ButtonLink, PageHeader, PageShell } from "@haruhimemoe/ui";
import { Palette } from "@/components/Palette";

export default async function Second({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return (
    <PageShell>
      <Palette />
      <PageHeader
        title="Second page"
        lead={
          params.id
            ? `Jumped to beatmap ${params.id} with ${params.mod ?? "no mod"}.`
            : "Here so Go to / Go back do something."
        }
        actions={<ButtonLink href="/">Home</ButtonLink>}
      />
    </PageShell>
  );
}
