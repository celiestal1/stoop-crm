"use client";

import { useState, useTransition } from "react";
import { extractListings, importListings, type ListingDraft } from "@/app/(crm)/actions";
import { money } from "@/lib/format";
import { readTable } from "@/lib/sheets";

type Mode = "link" | "text" | "file";

const MODES: { key: Mode; label: string; hint: string }[] = [
  { key: "link", label: "From a link", hint: "Paste the link to a listing, or to your website's page that lists all your properties." },
  { key: "text", label: "Paste text", hint: "Paste listing details from anywhere: an email, a flyer, a portal page or your own notes. Several listings at once is fine." },
  { key: "file", label: "Upload a spreadsheet", hint: "An Excel (.xlsx) or CSV file with one listing per row. Any column names work." },
];

export function ListingImport({ currency, area, initialUrl = "" }: { currency: string; area: string; initialUrl?: string }) {
  const [mode, setMode] = useState<Mode>("link");
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<ListingDraft[]>([]);
  const [picked, setPicked] = useState<boolean[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, start] = useTransition();

  function read(input: { url?: string; text?: string }) {
    setError("");
    setNotice("");
    setDrafts([]);
    start(async () => {
      const r = await extractListings(input);
      if (r.error) return setError(r.error);
      const found = r.listings ?? [];
      if (!found.length) return setError("No listings found there. Try pasting the listing details as text instead.");
      setDrafts(found);
      setPicked(found.map(() => true));
    });
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    const { table, error: readError } = await readTable(file);
    if (readError || !table) return setError(readError ?? "That file couldn't be read.");
    if (table.length < 2) return setError("That file has no listings in it.");
    read({ text: table.map((r) => r.join("\t")).join("\n") });
  }

  function add() {
    const chosen = drafts.filter((_, i) => picked[i]);
    start(async () => {
      const r = await importListings(chosen);
      if (r.error) return setError(r.error);
      setNotice(`Added ${r.added} listing${r.added === 1 ? "" : "s"}.`);
      setDrafts([]);
      setUrl("");
      setText("");
    });
  }

  const count = picked.filter(Boolean).length;

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="h2">Add listings in bulk</h2>
        <p className="mt-1 text-sm text-slate-600">AI reads the details for you. You check them before anything is saved.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${mode === m.key ? "bg-navy text-white" : "bg-sidewalk text-navy hover:bg-slate-200"}`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-600">{MODES.find((m) => m.key === mode)!.hint}</p>

      {mode === "link" && (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (url.trim()) read({ url });
          }}
        >
          <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" required placeholder="https://" className="input flex-1" />
          <button className="btn-primary" disabled={busy}>{busy ? "Reading…" : "Find listings"}</button>
        </form>
      )}
      {mode === "text" && (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) read({ text });
          }}
        >
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} required className="input" placeholder="Paste listing details here" />
          <button className="btn-primary" disabled={busy}>{busy ? "Reading…" : "Find listings"}</button>
        </form>
      )}
      {mode === "file" && (
        <div className="space-y-2">
          <input type="file" accept=".xlsx,.csv,.txt,text/csv" disabled={busy} onChange={(e) => onFile(e.target.files?.[0])} className="text-sm" />
          {busy && <p className="text-sm text-slate-500">Reading…</p>}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {notice && <p className="text-sm font-medium text-green-700">{notice}</p>}

      {drafts.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">Found {drafts.length}. Untick any you don&apos;t want.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="p-2" />
                  <th className="p-2">Address</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Beds</th>
                  <th className="p-2">Baths</th>
                  <th className="p-2">{area}</th>
                  <th className="p-2">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drafts.map((d, i) => (
                  <tr key={i}>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={picked[i] ?? false}
                        onChange={(e) => setPicked((p) => p.map((v, j) => (j === i ? e.target.checked : v)))}
                      />
                    </td>
                    <td className="p-2">
                      <p className="font-medium">{d.address}</p>
                      {d.city && <p className="text-xs text-slate-500">{d.city}</p>}
                    </td>
                    <td className="whitespace-nowrap p-2">{d.list_price != null ? money(d.list_price, currency) : ""}</td>
                    <td className="p-2">{d.beds ?? ""}</td>
                    <td className="p-2">{d.baths ?? ""}</td>
                    <td className="p-2">{d.sqft ?? ""}</td>
                    <td className="p-2">{d.property_type ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn-primary" disabled={busy || !count} onClick={add}>
            {busy ? "Adding…" : `Add ${count} listing${count === 1 ? "" : "s"}`}
          </button>
        </div>
      )}
    </section>
  );
}
