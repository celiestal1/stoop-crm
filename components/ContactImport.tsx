"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { importContacts } from "@/app/(crm)/actions";
import { guessMapping, IMPORT_FIELDS, type ImportField, type Mapping, parseCsv, parseVcf, toRows } from "@/lib/contactImport";
import { CONTACT_TYPES, label } from "@/lib/format";

export function ContactImport() {
  const [fileName, setFileName] = useState("");
  const [table, setTable] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping>({});
  const [defaultType, setDefaultType] = useState("buyer");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => (table.length ? toRows(table, mapping) : []), [table, mapping]);
  const headers = table[0] ?? [];

  async function onFile(file: File | undefined) {
    setError("");
    setResult(null);
    setTable([]);
    if (!file) return;
    if (/\.(xlsx|xls|numbers)$/i.test(file.name)) {
      setError("Save the spreadsheet as CSV first (File → Save As → CSV), then choose that file.");
      return;
    }
    const text = await file.text();
    const parsed = /\.vcf$/i.test(file.name) || /^\s*BEGIN:VCARD/i.test(text) ? parseVcf(text) : parseCsv(text);
    if (parsed.length < 2) {
      setError("That file has no contacts in it.");
      return;
    }
    setFileName(file.name);
    setTable(parsed);
    setMapping(guessMapping(parsed[0]));
  }

  function setField(field: ImportField, value: string) {
    setMapping((m) => {
      const next = { ...m };
      if (value === "") delete next[field];
      else next[field] = Number(value);
      return next;
    });
  }

  function onImport() {
    setError("");
    startTransition(async () => {
      const res = await importContacts(rows, defaultType);
      if ("error" in res && res.error) setError(res.error);
      else setResult({ added: res.added ?? 0, skipped: res.skipped ?? 0 });
    });
  }

  if (result) {
    return (
      <div className="card space-y-3">
        <h2 className="h2">Import finished</h2>
        <p>
          Added <strong>{result.added}</strong> contact{result.added === 1 ? "" : "s"}.
          {result.skipped > 0 && ` Skipped ${result.skipped} already in Stoop (same email or phone).`}
        </p>
        <div className="flex gap-2">
          <Link href="/contacts" className="btn-primary">See contacts</Link>
          <button className="btn-ghost" onClick={() => { setResult(null); setTable([]); setFileName(""); }}>
            Import another file
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h2 className="h2">1. Choose a file</h2>
        <p className="text-sm text-slate-600">
          A CSV from Excel or Google Contacts, or a vCard (.vcf) from iPhone Contacts. The first row of a CSV should be
          column names.
        </p>
        <input
          type="file"
          accept=".csv,.vcf,.txt,.xlsx,.xls,text/csv,text/vcard"
          className="block w-full text-sm file:btn-ghost file:mr-3"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {table.length > 0 && (
        <>
          <div className="card space-y-3">
            <h2 className="h2">2. Match the columns</h2>
            <p className="text-sm text-slate-600">We guessed from the column names in {fileName}. Fix any that are wrong.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {IMPORT_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="field-label">{f.label}</span>
                  <select
                    className="input"
                    value={mapping[f.key] ?? ""}
                    onChange={(e) => setField(f.key, e.target.value)}
                  >
                    <option value="">Not in file</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                    ))}
                  </select>
                </label>
              ))}
              <label className="block">
                <span className="field-label">Type when the file has none</span>
                <select className="input" value={defaultType} onChange={(e) => setDefaultType(e.target.value)}>
                  {CONTACT_TYPES.map((t) => (
                    <option key={t} value={t}>{label(t)}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="card space-y-3 overflow-x-auto">
            <h2 className="h2">3. Check and import</h2>
            <p className="text-sm text-slate-600">
              {rows.length} contact{rows.length === 1 ? "" : "s"} found. The first few:
            </p>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-4">{[r.first_name, r.last_name].filter(Boolean).join(" ") || "–"}</td>
                    <td className="py-2 pr-4">{r.email || "–"}</td>
                    <td className="py-2 pr-4">{r.phone || "–"}</td>
                    <td className="py-2 pr-4">{label(r.contact_type || defaultType)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="btn-primary" disabled={pending || !rows.length} onClick={onImport}>
              {pending ? "Importing…" : `Import ${rows.length} contact${rows.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
