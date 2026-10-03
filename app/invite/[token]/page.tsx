import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";

export default async function Invite({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: rows } = await supabase.rpc("get_invite", { invite_token: token });
  const invite = Array.isArray(rows) ? rows[0] : null;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function accept() {
    "use server";
    const sb = await createClient();
    const { error } = await sb.rpc("accept_invite", { invite_token: token });
    if (error) throw new Error(error.message);
    redirect("/today");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md space-y-4">
        <Logo />
        {!invite || !invite.valid ? (
          <p>This invite is invalid or has expired. Ask your team for a new link.</p>
        ) : (
          <>
            <h1 className="h1">Join {invite.org_name} on Stoop</h1>
            {user ? (
              <form action={accept}>
                <button className="btn-primary w-full">Accept invite</button>
              </form>
            ) : (
              <p className="text-sm">
                <Link href="/login" className="underline">Sign in or create an account</Link> with {invite.email}, then open this link again.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
