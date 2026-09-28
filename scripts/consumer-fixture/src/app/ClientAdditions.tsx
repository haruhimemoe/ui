"use client";

import { AsyncButton, Disclosure, InlineConfirm, Pagination } from "@haruhimemoe/ui";
import { useState } from "react";

// The 0.4.0 components that take callbacks, from a client file.
export function ClientAdditions() {
  const [page, setPage] = useState(2);
  return (
    <section aria-label="Client additions">
      <InlineConfirm trigger="Delete pack" question="Delete it for good?" onConfirm={() => {}} />
      <AsyncButton action={async () => "Rebuilt."}>Refresh pages</AsyncButton>
      <Disclosure summary="Download options">
        <p>Include video</p>
      </Disclosure>
      <Pagination page={page} pageCount={null} hasNext onPageChange={setPage} />
    </section>
  );
}
