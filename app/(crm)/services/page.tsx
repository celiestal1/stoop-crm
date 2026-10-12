import { ContactCard } from "@/components/ContactBuilder";
import { SERVICES, STEPS } from "@/lib/builder";

export default function Services() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">My services</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          I build software and digital tools for small businesses, in any industry. You get something made for how you
          work, not a one-size-fits-all app, and I stay around to set it up and support it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <section key={s.title} className="card">
            <div className="mb-3 h-1.5 w-10 rounded-full bg-amber" />
            <h2 className="h2">{s.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{s.body}</p>
          </section>
        ))}
      </div>

      <section className="card">
        <h2 className="h2">How working together goes</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-lg bg-sidewalk p-4">
              <p className="font-display text-lg font-semibold text-amber">{i + 1}</p>
              <p className="font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <ContactCard />
    </div>
  );
}
