import Link from "next/link";
import { notFound } from "next/navigation";
import { addDealDate, addDeal, addTask, deleteContact, logActivity, markReplied, updateContact } from "../../actions";
import { Composer } from "@/components/Composer";
import { ScoreButton } from "@/components/ScoreButton";
import { TaskCheck } from "@/components/TaskCheck";
import { CONTACT_STATUSES, CONTACT_TYPES, DEADLINES, day, dialable, fullName, label, money, when } from "@/lib/format";
import { getSession } from "@/lib/session";

const ICON: Record<string, string> = { call: "📞", email: "✉️", text: "💬", note: "📝", showing: "🏠", meeting: "🤝", ai: "✨" };

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, org } = await getSession();
  const tz = org.timezone || "America/New_York";

  const [{ data: c }, { data: activities }, { data: messages }, { data: tasks }, { data: deals }, { data: google }] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).maybeSingle(),
    supabase.from("activities").select("id, type, body, created_at").eq("contact_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("messages").select("id, channel, direction, subject, body, summary, created_at").eq("contact_id", id).order("created_at", { ascending: false }).limit(30),
    supabase.from("tasks").select("id, title, due_at, done").eq("contact_id", id).order("done").order("due_at"),
    supabase.from("deals").select("id, title, price, pipeline_stages(name), deal_dates(id, label, due_date, completed)").eq("contact_id", id),
    supabase.from("integrations").select("status").eq("user_id", user.id).eq("provider", "google").maybeSingle(),
  ]);
  if (!c) notFound();

  const tel = dialable(c.phone);
  const update = updateContact.bind(null, id);
  const log = logActivity.bind(null, id);
  const replied = markReplied.bind(null, id);

  return (
    <div className="space-y-6">
      <Link href="/contacts" className="text-sm underline">← Contacts</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="h1">{fullName(c)}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {label(c.contact_type)} · {label(c.status)}
            {c.source ? ` · from ${label(c.source)}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tel && <a href={`tel:${tel}`} className="btn-primary">Call {c.phone}</a>}
          {c.email && <a href={`mailto:${c.email}`} className="btn-ghost">{c.email}</a>}
        </div>
      </div>

      {c.needs_reply && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber bg-amber-soft p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide">Waiting on you</p>
            <p className="text-sm">{c.last_inbound_summary ?? "Needs a reply"}</p>
          </div>
          <form action={replied}>
            <button className="btn-ghost">Mark as replied</button>
          </form>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Composer contactId={id} email={c.email} phone={c.phone} canEmail={google?.status === "connected"} />

          <form action={log} className="card space-y-3">
            <h2 className="h2">Log a call, text or note</h2>
            <div className="flex flex-wrap gap-2">
              <select name="type" className="input w-auto" defaultValue="call">
                <option value="call">Call</option>
                <option value="text">Text</option>
                <option value="note">Note</option>
                <option value="showing">Showing</option>
                <option value="meeting">Meeting</option>
              </select>
              <input name="body" required placeholder="What happened? e.g. Left voicemail about Saturday showing" className="input flex-1" />
              <button className="btn-primary">Save</button>
            </div>
          </form>

          <section className="card">
            <h2 className="h2">Timeline</h2>
            <ul className="mt-3 space-y-3">
              {[
                ...(messages ?? []).map((m) => ({
                  id: `m-${m.id}`,
                  at: m.created_at,
                  icon: m.channel === "email" ? "✉️" : m.channel === "sms" ? "💬" : "📞",
                  title: `${m.direction === "inbound" ? "They" : "You"} ${m.channel === "email" ? "emailed" : m.channel === "sms" ? "texted" : "called"}${m.subject ? `: ${m.subject}` : ""}`,
                  body: m.summary ?? m.body?.slice(0, 300),
                })),
                ...(activities ?? []).map((a) => ({ id: `a-${a.id}`, at: a.created_at, icon: ICON[a.type] ?? "•", title: label(a.type), body: a.body })),
              ]
                .sort((a, b) => b.at.localeCompare(a.at))
                .map((e) => (
                  <li key={e.id} className="flex gap-3 text-sm">
                    <span aria-hidden>{e.icon}</span>
                    <div>
                      <p className="font-medium">
                        {e.title} <span className="text-xs font-normal text-slate-500">{when(e.at, tz)}</span>
                      </p>
                      {e.body && <p className="whitespace-pre-line text-slate-600">{e.body}</p>}
                    </div>
                  </li>
                ))}
              {!messages?.length && !activities?.length && <li className="text-sm text-slate-500">Nothing yet.</li>}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card">
            <div className="flex items-center justify-between">
              <h2 className="h2">Lead score</h2>
              <ScoreButton contactId={id} />
            </div>
            <p className="mt-2 font-display text-3xl font-bold">{c.ai_score ?? "–"}</p>
            {c.ai_summary && <p className="mt-1 text-sm text-slate-600">{c.ai_summary}</p>}
          </section>

          <section className="card">
            <h2 className="h2">Tasks</h2>
            <ul className="mt-3 space-y-2">
              {(tasks ?? []).map((t) => (
                <li key={t.id} className="flex items-start gap-3 text-sm">
                  <TaskCheck id={t.id} done={t.done} />
                  <div className={t.done ? "text-slate-400 line-through" : ""}>
                    <p>{t.title}</p>
                    {t.due_at && <p className="text-xs text-slate-500">{when(t.due_at, tz)}</p>}
                  </div>
                </li>
              ))}
            </ul>
            <form action={addTask} className="mt-3 space-y-2">
              <input type="hidden" name="contact_id" value={id} />
              <input name="title" required placeholder="New task" className="input" />
              <input name="due_at" type="datetime-local" className="input" />
              <button className="btn-ghost w-full">Add task</button>
            </form>
          </section>

          <section className="card">
            <h2 className="h2">Deals</h2>
            <ul className="mt-2 space-y-3 text-sm">
              {(deals ?? []).map((d) => {
                const dates = (d.deal_dates as unknown as { id: string; label: string; due_date: string; completed: boolean }[]) ?? [];
                return (
                  <li key={d.id}>
                    <p>
                      {d.title} · {money(d.price)}{" "}
                      <span className="pill">{(d.pipeline_stages as unknown as { name: string } | null)?.name ?? "No stage"}</span>
                    </p>
                    {dates.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-xs text-slate-600">
                        {dates
                          .sort((a, b) => a.due_date.localeCompare(b.due_date))
                          .map((x) => (
                            <li key={x.id} className={x.completed ? "line-through" : ""}>
                              {x.label}: {day(x.due_date)}
                            </li>
                          ))}
                      </ul>
                    )}
                    <details className="mt-1">
                      <summary className="cursor-pointer text-xs underline">+ Contract deadline</summary>
                      <form action={addDealDate.bind(null, d.id)} className="mt-2 flex flex-wrap gap-2">
                        <select name="label" className="input w-auto text-xs">
                          {DEADLINES.map((x) => <option key={x}>{x}</option>)}
                        </select>
                        <input name="due_date" type="date" required className="input w-auto text-xs" />
                        <button className="btn-ghost px-2 py-1 text-xs">Add</button>
                      </form>
                    </details>
                  </li>
                );
              })}
              {!deals?.length && <li className="text-slate-500">No deals yet.</li>}
            </ul>
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium underline">+ New deal</summary>
              <form action={addDeal} className="mt-3 space-y-2">
                <input type="hidden" name="contact_id" value={id} />
                <input name="title" required placeholder="Address or buyer search" className="input" />
                <div className="flex gap-2">
                  <select name="deal_type" className="input" defaultValue={c.contact_type === "seller" ? "listing" : "buyer"}>
                    <option value="buyer">Buyer</option>
                    <option value="listing">Listing</option>
                  </select>
                  <input name="price" inputMode="numeric" placeholder="Price" className="input" />
                </div>
                <label className="field-label">Expected close</label>
                <input name="expected_close_date" type="date" className="input" />
                <button className="btn-primary w-full">Create deal</button>
              </form>
            </details>
          </section>

          <form action={update} className="card space-y-3">
            <h2 className="h2">Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <input name="first_name" defaultValue={c.first_name ?? ""} placeholder="First name" className="input" />
              <input name="last_name" defaultValue={c.last_name ?? ""} placeholder="Last name" className="input" />
            </div>
            <input name="email" type="email" defaultValue={c.email ?? ""} placeholder="Email" className="input" />
            <input name="phone" defaultValue={c.phone ?? ""} placeholder="Phone" className="input" />
            <div className="grid grid-cols-2 gap-2">
              <select name="contact_type" defaultValue={c.contact_type} className="input">
                {CONTACT_TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
              </select>
              <select name="status" defaultValue={c.status} className="input">
                {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input name="budget_min" defaultValue={c.budget_min ?? ""} placeholder="Budget min" className="input" />
              <input name="budget_max" defaultValue={c.budget_max ?? ""} placeholder="Budget max" className="input" />
            </div>
            <input name="preferred_areas" defaultValue={(c.preferred_areas ?? []).join(", ")} placeholder="Areas (comma separated)" className="input" />
            <input name="timeline" defaultValue={c.timeline ?? ""} placeholder="Timeline, e.g. 3 months" className="input" />
            <input name="source" defaultValue={c.source ?? ""} placeholder="Source" className="input" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="pre_approved" defaultChecked={!!c.pre_approved} className="accent-navy" /> Pre-approved
            </label>
            <textarea name="notes" defaultValue={c.notes ?? ""} rows={4} placeholder="Notes" className="input" />
            <button className="btn-primary w-full">Save details</button>
          </form>

          <details className="text-right">
            <summary className="cursor-pointer list-none text-xs text-slate-500 hover:text-red-600">Delete contact</summary>
            <form action={deleteContact.bind(null, id)} className="mt-2">
              <p className="mb-2 text-xs text-slate-500">This also deletes their activity, tasks and emails. Deals stay in the pipeline.</p>
              <button className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white">Yes, delete</button>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
}
