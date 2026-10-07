import Link from "next/link";
import { addContact } from "../actions";
import { CONTACT_STATUSES, CONTACT_TYPES, fullName, label } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function Contacts({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const { supabase } = await getSession();

  let query = supabase
    .from("contacts")
    .select("id, first_name, last_name, email, phone, contact_type, status, ai_score, needs_reply")
    .order("needs_reply", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  if (q) {
    const term = q.replace(/[%,()]/g, " ").trim();
    query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`);
  }
  const { data: contacts } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="h1">Contacts</h1>
        <Link href="/contacts/import" className="btn-ghost">Import</Link>
      </div>

      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, email or phone" className="input max-w-xs" />
        <select name="status" defaultValue={status ?? ""} className="input w-auto">
          <option value="">All statuses</option>
          {CONTACT_STATUSES.map((s) => (
            <option key={s} value={s}>{label(s)}</option>
          ))}
        </select>
        <button className="btn-ghost">Filter</button>
      </form>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-sidewalk text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 sm:table-cell">Phone</th>
              <th className="hidden px-4 py-3 md:table-cell">Email</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(contacts ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-sidewalk">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${c.id}`} className="font-semibold hover:underline">{fullName(c)}</Link>
                  {c.needs_reply && <span className="ml-2 rounded-full bg-amber-soft px-2 py-0.5 text-xs font-semibold">Waiting</span>}
                </td>
                <td className="px-4 py-3">{label(c.contact_type)}</td>
                <td className="px-4 py-3"><span className="pill">{label(c.status)}</span></td>
                <td className="hidden px-4 py-3 sm:table-cell">{c.phone}</td>
                <td className="hidden px-4 py-3 md:table-cell">{c.email}</td>
                <td className="px-4 py-3">{c.ai_score ?? "–"}</td>
              </tr>
            ))}
            {!contacts?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No contacts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form action={addContact} className="card grid gap-3 sm:grid-cols-3">
        <h2 className="h2 sm:col-span-3">Add a contact</h2>
        <input name="first_name" placeholder="First name" className="input" />
        <input name="last_name" placeholder="Last name" className="input" />
        <select name="contact_type" className="input" defaultValue="buyer">
          {CONTACT_TYPES.map((t) => (
            <option key={t} value={t}>{label(t)}</option>
          ))}
        </select>
        <input name="email" type="email" placeholder="Email" className="input" />
        <input name="phone" placeholder="Phone" className="input" />
        <input name="source" placeholder="Source (e.g. referral)" className="input" />
        <div className="sm:col-span-3">
          <button className="btn-primary">Add contact</button>
        </div>
      </form>
    </div>
  );
}
