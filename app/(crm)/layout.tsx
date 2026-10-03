import Link from "next/link";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { getSession } from "@/lib/session";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const { org, user } = await getSession();
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-navy text-white md:sticky md:top-0 md:flex md:h-screen md:w-56 md:flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/today">
            <Logo light />
          </Link>
        </div>
        <NavLinks />
        <div className="hidden px-4 py-4 text-xs text-slate-300 md:mt-auto md:block">
          <p className="truncate font-semibold text-white">{org.name}</p>
          <p className="truncate">{user.email}</p>
          <form action="/auth/signout" method="post" className="mt-2">
            <button className="text-slate-300 underline hover:text-white">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
