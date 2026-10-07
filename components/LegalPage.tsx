import Link from "next/link";
import { Logo } from "@/components/Logo";

// Shared frame for the privacy policy and terms pages.
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sidewalk">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/login" className="btn-ghost">
          Sign in
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16">
        <article className="card space-y-4 text-sm leading-relaxed text-slate-700 [&_h2]:h2 [&_h2]:pt-4 [&_li]:ml-5 [&_li]:list-disc [&_a]:underline">
          <h1 className="h1">{title}</h1>
          <p className="text-slate-500">Last updated {updated}</p>
          {children}
        </article>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/privacy" className="hover:underline">Privacy</Link> · <Link href="/terms" className="hover:underline">Terms</Link> · hello@stoopcrm.com
        </p>
      </main>
    </div>
  );
}
