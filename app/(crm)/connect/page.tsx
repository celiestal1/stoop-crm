import { headers } from "next/headers";
import { saveWebsite } from "../actions";
import { CopyBox } from "@/components/CopyBox";
import { GoogleConnect } from "@/components/GoogleConnect";
import { LeadAlertsToggle } from "@/components/LeadAlertsToggle";
import { ListingImport } from "@/components/ListingImport";
import { agentLoginCode, leadFormCode } from "@/lib/leadForm";
import { region } from "@/lib/region";
import { getSession } from "@/lib/session";

export default async function Connect() {
  const { supabase, user, org } = await getSession();
  const r = region(org.country);
  const { data: google } = await supabase
    .from("integrations")
    .select("status, account")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .maybeSingle();

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const { leadUrl, formCode } = leadFormCode(org.lead_key);
  const loginCode = agentLoginCode(origin);
  const handoff = `mailto:?subject=${encodeURIComponent("Two small additions to our website")}&body=${encodeURIComponent(
    `Hi,\n\nCould you add these two things to our website?\n\n1. An "Agent login" link in the footer or menu:\n${loginCode}\n\n2. This contact form on the contact page and on each listing page (or point our existing contact form to ${leadUrl}):\n${formCode}\n\nThank you!`,
  )}`;

  const step = (n: number, done: boolean) => (
    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${done ? "bg-green-600 text-white" : "bg-amber text-navy"}`}>
      {done ? "✓" : n}
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Connect your website</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Three steps and Stoop works alongside the website you already have: your listings come in, inquiries from your
          site land here as leads, and you get an email in Gmail for each one.
        </p>
      </div>

      <section className="card space-y-4">
        <div className="flex items-center gap-3">
          {step(1, !!org.website_url)}
          <h2 className="h2">Your website and listings</h2>
        </div>
        <form action={saveWebsite} className="flex flex-wrap gap-2">
          <input
            name="website_url"
            defaultValue={org.website_url ?? ""}
            placeholder="youragency.com"
            className="input max-w-md flex-1"
            required
          />
          <button className="btn-primary">{org.website_url ? "Update" : "Save"}</button>
        </form>
        {org.website_url && (
          <>
            <p className="text-sm text-slate-600">
              Now bring your listings in. Paste the page on your site that shows all your properties (the link below is your
              homepage; change it if your listings live on another page).
            </p>
            <ListingImport currency={r.currency} area={r.area} initialUrl={org.website_url} />
          </>
        )}
      </section>

      <section className="card space-y-4">
        <div className="flex items-center gap-3">
          {step(2, false)}
          <h2 className="h2">Add an agent login and contact form to your site</h2>
        </div>
        <p className="text-sm text-slate-600">
          Your clients keep seeing your normal website. These two small additions give you and your agents a way in, and send
          every inquiry straight into Stoop as a lead with a follow-up task. Whoever manages your website can add them in a few
          minutes.
        </p>
        <a href={handoff} className="btn-amber">Email these to my web person</a>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="field-label">Agent login link</p>
            <CopyBox value={loginCode} />
          </div>
          <div>
            <p className="field-label">Already have a contact form? Send it to this address</p>
            <CopyBox value={leadUrl} />
          </div>
        </div>
        <div>
          <p className="field-label">Or use this ready-made contact form</p>
          <CopyBox value={formCode} rows={9} />
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex items-center gap-3">
          {step(3, google?.status === "connected")}
          <h2 className="h2">Get inquiries in Gmail</h2>
        </div>
        <GoogleConnect status={google?.status ?? null} account={google?.account ?? null} returnTo="/connect" />
        <LeadAlertsToggle on={org.lead_alerts} />
      </section>
    </div>
  );
}
