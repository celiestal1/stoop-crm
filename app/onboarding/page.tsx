import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

async function createWorkspace(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_organization", { org_name: name });
  if (error) throw new Error(error.message);
  redirect("/settings?welcome=1");
}

export default async function Onboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: member } = await supabase.from("members").select("org_id").eq("user_id", user.id).limit(1).maybeSingle();
  if (member) redirect("/today");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form action={createWorkspace} className="card w-full max-w-md space-y-4">
        <Logo />
        <h1 className="h1">Name your workspace</h1>
        <p className="text-sm text-slate-600">Usually your name or your team&apos;s name. You can change it later. Joining a team? Open the invite link they sent you instead.</p>
        <input name="name" required className="input" placeholder="e.g. Rams Real Estate" />
        <button className="btn-primary w-full">Continue</button>
      </form>
    </main>
  );
}
