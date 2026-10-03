import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// The signed-in agent and their workspace. Redirects when either is missing.
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("org_id, role, organizations(name, timezone, lead_key)")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();
  if (!member) redirect("/onboarding");

  const org = member.organizations as unknown as { name: string; timezone: string; lead_key: string };
  return { supabase, user, orgId: member.org_id as string, role: member.role as string, org };
}
