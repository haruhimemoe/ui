"use client";

import {
  AsyncButton,
  Chip,
  ChoiceChips,
  Disclosure,
  InlineConfirm,
  Pagination,
  RadioGroup,
  TypeToConfirm,
} from "@haruhimemoe/ui";
import { useState } from "react";

// The 0.4.0 components that take callbacks, from a client file.
export function ClientAdditions() {
  const [page, setPage] = useState(2);
  const [status, setStatus] = useState("all");
  return (
    <section aria-label="Client additions">
      <InlineConfirm trigger="Delete pack" question="Delete it for good?" onConfirm={() => {}} />
      <AsyncButton action={async () => "Rebuilt."}>Refresh pages</AsyncButton>
      <Disclosure summary="Download options">
        <p>Include video</p>
      </Disclosure>
      <Pagination page={page} pageCount={null} hasNext onPageChange={setPage} />
      <ChoiceChips
        label="Status"
        options={[
          { value: "all", label: "All" },
          { value: "ranked", label: "Ranked" },
        ]}
        value={status}
        onChange={setStatus}
      />
      <Chip pressed={false} unavailableReason="EZ can't go with HR.">
        EZ
      </Chip>
      <RadioGroup
        label="Who can see this pool"
        options={[
          { value: "private", label: "Private" },
          { value: "public", label: "Public", hint: "Listed on the site." },
        ]}
        defaultValue="private"
      />
      <TypeToConfirm
        id="delete-pool"
        expected="OWC 2026"
        submitLabel="Delete this pool"
        onConfirm={() => {}}
      />
    </section>
  );
}
