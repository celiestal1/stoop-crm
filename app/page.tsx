import Link from "next/link";
import { Logo } from "@/components/Logo";

const FEATURES = [
  {
    title: "Waiting on you",
    body: "Every client email gets a one-line summary, so your Today screen shows exactly who is waiting and what they asked.",
  },
  {
    title: "Leads in, automatically",
    body: "Zillow, Realtor.com and StreetEasy alerts, your website form and your open house sign-in all become leads with a follow-up task.",
  },
  {
    title: "Your number, your phone",
    body: "Keep your business number. Call and text clients with one tap from Stoop and every conversation stays on their timeline.",
  },
  {
    title: "Replies drafted for you",
    body: "Draft with AI writes a reply from the whole conversation. You read it, edit it and send it from your own Gmail.",
  },
  {
    title: "Pipeline at a glance",
    body: "Drag deals from showing to closing, with contract deadlines on your Today screen before they sneak up on you.",
  },
  {
    title: "Set up for you",
    body: "We import your contacts from Excel, Google or your iPhone, connect your Gmail and calendar, and train you and your team.",
  },
];

export default function Home() {
  return (
    <div className="bg-sidewalk">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-3 text-sm">
          <a href="#pricing" className="hidden text-slate-600 hover:text-navy sm:inline">
            Pricing
          </a>
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-20">
        <p className="mb-4 inline-block rounded-full bg-amber-soft px-3 py-1 text-xs font-semibold text-navy">
          Built for New York City agents
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-navy sm:text-6xl">
          Every lead answered. Nothing falls through.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Stoop is the CRM that tells you who is waiting on you, drafts the reply, and keeps every
          client, deal and deadline in one place. Never leave a lead waiting on the stoop.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="mailto:hello@stoopcrm.com?subject=Founding%20agent%20pilot" className="btn-amber px-6 py-3 text-base">
            Become a founding agent
          </a>
          <Link href="/login" className="btn-ghost px-6 py-3 text-base">
            Sign in
          </Link>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 p-6">
              <div className="mb-3 h-1.5 w-10 rounded-full bg-amber" />
              <h3 className="h2">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold">Simple pricing</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="h2">Setup</h3>
            <p className="mt-2 font-display text-3xl font-bold">[$ price]</p>
            <p className="mt-2 text-sm text-slate-600">
              One time. Contact import, Gmail and calendar connection, website lead form, and training.
            </p>
          </div>
          <div className="card">
            <h3 className="h2">Per agent</h3>
            <p className="mt-2 font-display text-3xl font-bold">
              [$ price]<span className="text-base font-normal text-slate-500"> / month</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">Everything in Stoop, including AI replies and lead capture.</p>
          </div>
        </div>
        <div className="mt-6 rounded-xl bg-navy p-6 text-white">
          <h3 className="font-display text-xl font-semibold">Founding agents: 30 days free</h3>
          <p className="mt-2 text-sm text-slate-200">
            We are taking a few agents for a free 30-day pilot in exchange for honest feedback.
          </p>
          <a href="mailto:hello@stoopcrm.com?subject=Founding%20agent%20pilot" className="btn-amber mt-4">
            Apply for the pilot
          </a>
        </div>
      </section>

      <footer className="bg-navy py-10 text-sm text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
          <Logo light />
          <span>© {new Date().getFullYear()} Stoop · hello@stoopcrm.com</span>
        </div>
      </footer>
    </div>
  );
}
