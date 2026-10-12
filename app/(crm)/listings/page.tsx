import { addListing } from "../actions";
import { ListingDescriber } from "@/components/ListingDescriber";
import { ListingImport } from "@/components/ListingImport";
import { PROPERTY_STATUSES, label, money } from "@/lib/format";
import { region } from "@/lib/region";
import { getSession } from "@/lib/session";

export default async function Listings() {
  const { supabase, org } = await getSession();
  const r = region(org.country);
  const { data: listings } = await supabase.from("properties").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="h1">Listings</h1>

      <div className="space-y-4">
        {(listings ?? []).map((p) => (
          <div key={p.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-semibold">{p.address}</p>
                <p className="text-sm text-slate-600">
                  {[p.city, p.state, p.zip].filter(Boolean).join(", ")}
                  {r.mls && p.mls_number ? ` · MLS ${p.mls_number}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-semibold">{money(p.list_price, r.currency)}</p>
                <span className="pill">{label(p.status)}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {[p.beds != null && `${p.beds} bd`, p.baths != null && `${p.baths} ba`, p.sqft && `${p.sqft} ${r.area}`, p.property_type].filter(Boolean).join(" · ")}
            </p>
            <ListingDescriber propertyId={p.id} initial={p.description} />
          </div>
        ))}
        {!listings?.length && <p className="text-sm text-slate-500">No listings yet.</p>}
      </div>

      <ListingImport currency={r.currency} area={r.area} />

      <form action={addListing} className="card grid gap-3 sm:grid-cols-4">
        <h2 className="h2 sm:col-span-4">Add one listing by hand</h2>
        <input name="address" required placeholder="Address" className="input sm:col-span-2" />
        <input name="city" placeholder={r.cityPlaceholder} className="input" />
        <input name="zip" placeholder={r.postal} className="input" />
        <input name="list_price" placeholder={r.pricePlaceholder} className="input" />
        <input name="beds" placeholder="Beds" className="input" />
        <input name="baths" placeholder="Baths" className="input" />
        <input name="sqft" placeholder={r.area === "m²" ? "Size (m²)" : "Sq ft"} className="input" />
        <input name="property_type" placeholder={r.typePlaceholder} className="input sm:col-span-2" />
        <select name="status" className="input" defaultValue="active">
          {PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <div className="sm:col-span-4">
          <button className="btn-primary">Add listing</button>
        </div>
      </form>
    </div>
  );
}
