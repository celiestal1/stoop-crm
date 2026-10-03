import { addDeal } from "../actions";
import { PipelineBoard } from "@/components/PipelineBoard";
import { fullName } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function Pipeline() {
  const { supabase } = await getSession();
  const [{ data: stages }, { data: deals }, { data: contacts }] = await Promise.all([
    supabase.from("pipeline_stages").select("id, name").order("position"),
    supabase.from("deals").select("id, title, price, stage_id, deal_type, contact_id, contacts(first_name, last_name)").order("updated_at", { ascending: false }),
    supabase.from("contacts").select("id, first_name, last_name").order("first_name").limit(500),
  ]);

  const rows = (deals ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    price: d.price,
    stage_id: d.stage_id,
    deal_type: d.deal_type,
    contact_id: d.contact_id,
    contact_name: d.contacts ? fullName(d.contacts as unknown as { first_name: string; last_name: string }) : null,
  }));

  return (
    <div className="space-y-6">
      <h1 className="h1">Pipeline</h1>
      <p className="hidden text-sm text-slate-500 md:block">Drag a deal to move it to another stage.</p>
      <PipelineBoard stages={stages ?? []} deals={rows} />

      <form action={addDeal} className="card grid gap-3 sm:grid-cols-3">
        <h2 className="h2 sm:col-span-3">Add a deal</h2>
        <input name="title" required placeholder="e.g. Chen, 2BR in Astoria" className="input sm:col-span-2" />
        <select name="deal_type" className="input" defaultValue="buyer">
          <option value="buyer">Buyer</option>
          <option value="listing">Listing</option>
        </select>
        <select name="contact_id" className="input" defaultValue="">
          <option value="">No contact</option>
          {(contacts ?? []).map((c) => (
            <option key={c.id} value={c.id}>{fullName(c)}</option>
          ))}
        </select>
        <select name="stage_id" className="input" defaultValue={stages?.[0]?.id}>
          {(stages ?? []).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input name="price" placeholder="Price" className="input" />
        <div className="sm:col-span-3">
          <label className="field-label" htmlFor="ecd">Expected close date</label>
          <input id="ecd" name="expected_close_date" type="date" className="input max-w-xs" />
        </div>
        <div className="sm:col-span-3">
          <button className="btn-primary">Add deal</button>
        </div>
      </form>
    </div>
  );
}
