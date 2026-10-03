"use client";

import { useState, useTransition } from "react";
import { scoreLead } from "@/app/(crm)/actions";

export function ScoreButton({ contactId }: { contactId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-2">
      <button
        className="text-xs underline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await scoreLead(contactId);
            setError("error" in r ? (r.error ?? "Couldn't score") : null);
          })
        }
      >
        {pending ? "Scoring…" : "Rescore"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
