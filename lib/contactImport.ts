// Reading contact files (CSV from Excel or Google, vCard from iPhone) into rows for import.

export const IMPORT_FIELDS = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "full_name", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "contact_type", label: "Type" },
  { key: "source", label: "Source" },
  { key: "notes", label: "Notes" },
] as const;

export type ImportField = (typeof IMPORT_FIELDS)[number]["key"];
export type ImportRow = Partial<Record<Exclude<ImportField, "full_name">, string>>;
export type Mapping = Partial<Record<ImportField, number>>;

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const src = text.replace(/^﻿/, "");
  // Excel in some regions saves with semicolons.
  const firstLine = src.slice(0, src.indexOf("\n") === -1 ? undefined : src.indexOf("\n"));
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

// vCards become a table with the same headers a CSV would have.
export function parseVcf(text: string): string[][] {
  const unfolded = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
  const rows: string[][] = [["First name", "Last name", "Full name", "Email", "Phone", "Notes"]];
  for (const card of unfolded.split(/BEGIN:VCARD/i).slice(1)) {
    const get = (prop: string) =>
      card
        .split(/\r?\n/)
        .find((l) => new RegExp(`^(item\\d+\\.)?${prop}[;:]`, "i").test(l))
        ?.replace(/^[^:]*:/, "")
        .replace(/\\,/g, ",")
        .replace(/\\n/gi, " ")
        .trim() ?? "";
    let [last = "", first = ""] = get("N").split(";");
    const full = get("FN") || get("ORG");
    if (!first && !last) {
      const parts = full.split(/\s+/);
      first = parts[0] ?? "";
      last = parts.slice(1).join(" ");
    }
    rows.push([first, last, full, get("EMAIL"), get("TEL"), get("NOTE")]);
  }
  return rows;
}

const HINTS: Record<ImportField, RegExp> = {
  first_name: /^(first|given|first.?name|given.?name|fname)$/,
  last_name: /^(last|surname|family|last.?name|family.?name|lname)$/,
  full_name: /^(name|full.?name|contact|contact.?name|display.?name|client)$/,
  email: /e.?mail/,
  phone: /phone|mobile|cell|tel/,
  contact_type: /^(type|contact.?type|category|client.?type)$/,
  source: /source|lead.?source|origin/,
  notes: /note|comment|description/,
};

// Guess which column holds each field from the header row. First match wins,
// so "E-mail 1 - Value" beats "E-mail 2 - Value" in Google exports.
export function guessMapping(headers: string[]): Mapping {
  const mapping: Mapping = {};
  const norm = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
  for (const field of Object.keys(HINTS) as ImportField[]) {
    const idx = norm.findIndex(
      (h, i) =>
        HINTS[field].test(h) &&
        !Object.values(mapping).includes(i) &&
        (field === "contact_type" || !/\b(type|label)\b/.test(h)),
    );
    if (idx >= 0) mapping[field] = idx;
  }
  if (mapping.first_name !== undefined || mapping.last_name !== undefined) delete mapping.full_name;
  return mapping;
}

export function toRows(table: string[][], mapping: Mapping): ImportRow[] {
  const cell = (r: string[], f: ImportField) => {
    const i = mapping[f];
    return i === undefined ? "" : (r[i] ?? "").trim();
  };
  return table.slice(1).map((r) => {
    let first = cell(r, "first_name");
    let last = cell(r, "last_name");
    const full = cell(r, "full_name");
    if (!first && !last && full) {
      const parts = full.split(/\s+/);
      first = parts[0];
      last = parts.slice(1).join(" ");
    }
    const row: ImportRow = {
      first_name: first,
      last_name: last,
      email: cell(r, "email").split(/[\s,;]+/)[0],
      phone: cell(r, "phone").split(/\s*[,;:]\s*/)[0],
      contact_type: cell(r, "contact_type"),
      source: cell(r, "source"),
      notes: cell(r, "notes"),
    };
    return row;
  }).filter((r) => r.first_name || r.last_name || r.email || r.phone);
}

export const phoneDigits = (p: string | null | undefined) => (p ?? "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
