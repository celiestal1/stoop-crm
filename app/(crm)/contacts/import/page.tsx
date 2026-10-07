import Link from "next/link";
import { ContactImport } from "@/components/ContactImport";

export default function ImportContacts() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/contacts" className="text-sm text-slate-600 hover:underline">← Contacts</Link>
        <h1 className="h1 mt-1">Import contacts</h1>
      </div>
      <ContactImport />
    </div>
  );
}
