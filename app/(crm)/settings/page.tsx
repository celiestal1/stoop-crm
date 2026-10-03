import { headers } from "next/headers";
import { inviteAgent, renameWorkspace, saveBusinessPhone } from "../actions";
import { GoogleConnect } from "@/components/GoogleConnect";
import { getSession } from "@/lib/session";

const GOOGLE_RESULT: Record<string, string> = {
  connected: "Google is connected.",
  partial: "Google connected, but some permissions were unchecked. Reconnect and allow Gmail and Calendar.",
  cancelled: "Google sign-in was cancelled.",
  expired: "That sign-in link expired. Try again.",
  error: "Google sign-in failed. Try again.",
};

export default async function Settings({ searchParams }: { searchParams: Promise<{ google?: string; welcome?: string }> }) {
  const { google: googleResult, welcome } = await searchParams;
  const { supabase, user, orgId, role, org } = await getSession();
  const isAdmin = role === "owner" || role === "admin";

  const [{ data: google }, { data: phone }, { data: members }, { data: invites }] = await Promise.all([
    supabase.from("integrations").select("status, account").eq("user_id", user.id).eq("provider", "google").maybeSingle(),
    supabase.from("agent_settings").select("business_phone, business_phone_type").eq("user_id", user.id).maybeSingle(),
    supabase.from("members").select("user_id, email, role").eq("org_id", orgId),
    supabase.from("invites").select("id, email, role, token, accepted_at").eq("org_id", orgId).is("accepted_at", null),
  ]);

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const { data: phones } = await supabase.from("agent_settings").select("user_id, business_phone").eq("org_id", orgId);
  const phoneOf = (id: string) => phones?.find((p) => p.user_id === id)?.business_phone;
  const leadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/lead-intake?key=${org.lead_key}`;
  const formCode = `<form action="${leadUrl}" method="POST">
  <input name="name" placeholder="Your name" required>
  <input name="email" type="email" placeholder="Email">
  <input name="phone" placeholder="Phone">
  <textarea name="message" placeholder="How can I help?"></textarea>
  <input name="website_url" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Send</button>
</form>`;

  return (
    <div className="space-y-6">
      <h1 className="h1">Settings</h1>
      {welcome && (
        <div className="rounded-xl border border-amber bg-amber-soft p-4 text-sm">
          Welcome to Stoop. Connect Google and add your business number below, then you&apos;re ready.
        </div>
      )}
      {googleResult && GOOGLE_RESULT[googleResult] && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">{GOOGLE_RESULT[googleResult]}</div>
      )}

      <section id="google" className="card space-y-3">
        <h2 className="h2">Gmail and Calendar</h2>
        <GoogleConnect status={google?.status ?? null} account={google?.account ?? null} />
      </section>

      <section id="phone" className="card space-y-3">
        <h2 className="h2">Your business phone</h2>
        <p className="text-sm text-slate-600">
          Keep the number your clients already have. Calls and texts go from your own phone: tap Call or Text on any
          contact and your phone opens with the number ready. Log each call or text on the contact so the timeline
          stays complete. Your team sees this number on the Team list.
        </p>
        <form action={saveBusinessPhone} className="flex flex-wrap gap-2">
          <input name="business_phone" defaultValue={phone?.business_phone ?? ""} placeholder="(212) 555-0100" className="input max-w-xs" />
          <select name="business_phone_type" defaultValue={phone?.business_phone_type ?? "cell"} className="input w-auto">
            <option value="cell">Cell</option>
            <option value="office">Office line</option>
            <option value="voip">VoIP (OpenPhone, RingCentral…)</option>
            <option value="other">Other</option>
          </select>
          <button className="btn-primary">Save</button>
        </form>
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Website lead form</h2>
        <p className="text-sm text-slate-600">
          Paste this on your website. Every submission becomes a lead with a follow-up task. Zapier and other tools can
          POST JSON to the same address.
        </p>
        <input readOnly value={leadUrl} className="input font-mono text-xs" />
        <textarea readOnly value={formCode} rows={8} className="input font-mono text-xs" />
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Team</h2>
        <ul className="space-y-1 text-sm">
          {(members ?? []).map((m) => (
            <li key={m.user_id}>
              {m.email ?? m.user_id} <span className="pill">{m.role}</span>
              {phoneOf(m.user_id) && <span className="ml-2 text-slate-500">{phoneOf(m.user_id)}</span>}
            </li>
          ))}
          {(invites ?? []).map((i) => (
            <li key={i.id} className="text-slate-500">
              {i.email} <span className="pill">invited</span>
              {isAdmin && <span className="ml-2 font-mono text-xs">{origin}/invite/{i.token}</span>}
            </li>
          ))}
        </ul>
        {isAdmin && <p className="text-xs text-slate-500">Send the invite link to the agent. It works for 14 days.</p>}
        {isAdmin && (
          <form action={inviteAgent} className="flex flex-wrap gap-2">
            <input name="email" type="email" required placeholder="agent@example.com" className="input max-w-xs" />
            <select name="role" className="input w-auto" defaultValue="agent">
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn-ghost">Create invite link</button>
          </form>
        )}
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Workspace</h2>
        <form action={renameWorkspace} className="flex flex-wrap gap-2">
          <input name="name" defaultValue={org.name} className="input max-w-xs" />
          <button className="btn-ghost">Rename</button>
        </form>
        <form action="/auth/signout" method="post">
          <button className="text-sm underline">Sign out</button>
        </form>
      </section>
    </div>
  );
}
