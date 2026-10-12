// Turns an uploaded contacts or listings file into a table of strings:
// Excel (.xlsx), CSV or vCard.
import { parseCsv, parseVcf } from "@/lib/contactImport";

export async function readTable(file: File): Promise<{ table?: string[][]; error?: string }> {
  if (/\.(xls|numbers)$/i.test(file.name)) {
    return { error: "Save the spreadsheet as .xlsx or CSV first (File → Save As), then choose that file." };
  }
  if (/\.xlsx$/i.test(file.name)) {
    const { readSheet } = await import("read-excel-file/browser");
    try {
      const rows = await readSheet(file);
      const table = rows
        .map((r) => r.map((c) => (c === null || c === undefined ? "" : c instanceof Date ? c.toISOString().slice(0, 10) : String(c))))
        .filter((r) => r.some((c) => c.trim()));
      return { table };
    } catch {
      return { error: "That Excel file couldn't be read. Try saving it as CSV instead." };
    }
  }
  const text = await file.text();
  return { table: /\.vcf$/i.test(file.name) || /^\s*BEGIN:VCARD/i.test(text) ? parseVcf(text) : parseCsv(text) };
}
