"use client";

import { useState, useTransition } from "react";
import { describeListing, saveListingDescription } from "@/app/(crm)/actions";

export function ListingDescriber({ propertyId, initial }: { propertyId: string; initial: string | null }) {
  const [text, setText] = useState(initial ?? "");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="mt-3 space-y-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Listing description" className="input" />
      <div className="flex flex-wrap gap-2">
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Highlights for AI (e.g. new kitchen, south light)" className="input flex-1" />
        <button
          className="btn-amber"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setMsg(null);
              const r = await describeListing(propertyId, notes);
              if ("error" in r) setMsg(r.error ?? "AI couldn't write a description.");
              else setText(r.text);
            })
          }
        >
          {pending ? "Writing…" : "Write with AI"}
        </button>
        <button
          className="btn-ghost"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await saveListingDescription(propertyId, text);
              setMsg("Saved.");
            })
          }
        >
          Save
        </button>
      </div>
      {msg && <p className="text-sm text-slate-600">{msg}</p>}
    </div>
  );
}
