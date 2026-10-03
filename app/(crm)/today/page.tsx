import Link from "next/link";
import { DealDateCheck } from "@/components/DealDateCheck";
import { TaskCheck } from "@/components/TaskCheck";
import { day, fullName, money, when, zonedToIso } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function Today() {
  const { supabase, user, org } = await getSession();
  const tz = org.timezone || "America/New_York";
  const todayLocal = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
  const endOfToday = new Date(zonedToIso(`${todayLocal}T23:59`, tz) ?? Date.now());
  const twoWeeks = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);

  const [waiting, tasks, dates, deals, stages, google] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, first_name, last_name, last_inbound_summary, last_inbound_at, ai_score")
      .eq("needs_reply", true)
      .order("last_inbound_at", { ascending: true, nullsFirst: false })
      .limit(25),
    supabase
      .from("tasks")
      .select("id, title, due_at, done, contact_id, contacts(first_name, last_name)")
      .eq("done", false)
      .lte("due_at", endOfToday.toISOString())
      .order("due_at")
      .limit(30),
    supabase
      .from("deal_dates")
      .select("id, label, due_date, deals(id, title)")
      .eq("completed", false)
      .lte("due_date", twoWeeks)
      .order("due_date")
      .limit(20),
    supabase.from("deals").select("price, stage_id"),
    supabase.from("pipeline_stages").select("id, name, position, is_lost").order("position"),
    supabase.from("integrations").select("status, last_error").eq("user_id", user.id).eq("provider", "google").maybeSingle(),
  ]);

  const totals = (stages.data ?? [])
    .filter((s) => !s.is_lost)
    .map((s) => {
      const inStage = (deals.data ?? []).filter((d) => d.stage_id === s.id);
      return { name: s.name, count: inStage.length, value: inStage.reduce((a, d) => a + Number(d.price ?? 0), 0) };
    });
  const googleNeedsReconnect = google.data && google.data.status === "error";
  const googleMissing = !google.data;

  return (
    <div className="space-y-6">
      <h1 className="h1">Today</h1>

      {googleNeedsReconnect && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber bg-amber-soft p-4">
          <p className="text-sm font-medium">Your Google connection expired, so new emails aren&apos;t coming in.</p>
          <Link href="/settings#google" className="btn-primary">Reconnect Google</Link>
        </div>
      )}
      {googleMissing && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm">Connect Gmail so client emails show up here automatically.</p>
          <Link href="/settings#google" className="btn-ghost">Connect Google</Link>
        </div>
      )}

      <section className="card">
        <h2 className="h2">Waiting on you</h2>
        {waiting.data?.length ? (
          <ul className="mt-3 divide-y divide-slate-100">
            {waiting.data.map((c) => (
              <li key={c.id}>
                <Link href={`/contacts/${c.id}`} className="flex items-start justify-between gap-4 py-3 hover:bg-sidewalk">
                  <div>
                    <p className="font-semibold">{fullName(c)}</p>
                    <p className="text-sm text-slate-600">{c.last_inbound_summary ?? "Needs a reply"}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-slate-500">{when(c.last_inbound_at, tz)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Nobody is waiting on you. Nice.</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="h2">Tasks due</h2>
          {tasks.data?.length ? (
            <ul className="mt-3 space-y-2">
              {tasks.data.map((t) => {
                const c = t.contacts as unknown as { first_name: string | null; last_name: string | null } | null;
                const overdue = t.due_at && new Date(t.due_at) < new Date();
                return (
                  <li key={t.id} className="flex items-start gap-3">
                    <TaskCheck id={t.id} done={t.done} />
                    <div className="text-sm">
                      <p>{t.title}</p>
                      <p className={`text-xs ${overdue ? "text-red-600" : "text-slate-500"}`}>
                        {when(t.due_at, tz)}
                        {c && t.contact_id && (
                          <>
                            {" · "}
                            <Link className="underline" href={`/contacts/${t.contact_id}`}>{fullName(c)}</Link>
                          </>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No tasks due today.</p>
          )}
        </section>

        <section className="card">
          <h2 className="h2">Contract deadlines (next 2 weeks)</h2>
          {dates.data?.length ? (
            <ul className="mt-3 space-y-2">
              {dates.data.map((d) => {
                const deal = d.deals as unknown as { id: string; title: string } | null;
                return (
                  <li key={d.id} className="flex items-start gap-3 text-sm">
                    <DealDateCheck id={d.id} />
                    <div>
                      <p>{d.label}{deal ? ` · ${deal.title}` : ""}</p>
                      <p className="text-xs text-slate-500">{day(d.due_date)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No deadlines coming up.</p>
          )}
        </section>
      </div>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="h2">Pipeline</h2>
          <Link href="/pipeline" className="text-sm underline">Open pipeline</Link>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {totals.map((t) => (
            <div key={t.name} className="rounded-lg bg-sidewalk p-3">
              <p className="text-xs text-slate-500">{t.name}</p>
              <p className="font-display text-lg font-semibold">{money(t.value) || "$0"}</p>
              <p className="text-xs text-slate-500">{t.count} deal{t.count === 1 ? "" : "s"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
