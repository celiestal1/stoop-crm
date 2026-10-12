import { BUILDER, CALL_HREF, CLIENT_HREF } from "@/lib/builder";

export function ContactButtons({ light = false }: { light?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      <a href={CALL_HREF} className="btn-amber">
        Hop on a call
      </a>
      <a href={CLIENT_HREF} className={light ? "btn border border-white/40 text-white hover:bg-white/10" : "btn-ghost"}>
        Email me about becoming a client
      </a>
    </div>
  );
}

export function ContactDetails({ light = false }: { light?: boolean }) {
  const muted = light ? "text-slate-300" : "text-slate-500";
  const link = light ? "text-white underline" : "underline";
  return (
    <dl className="grid gap-1 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
      <dt className={muted}>Email</dt>
      <dd>
        <a className={link} href={`mailto:${BUILDER.email}`}>{BUILDER.email}</a>
      </dd>
      <dt className={muted}>Phone or text</dt>
      <dd>
        <a className={link} href={BUILDER.phoneHref}>{BUILDER.phone}</a>
      </dd>
    </dl>
  );
}

export function ContactCard() {
  return (
    <section className="rounded-xl bg-navy p-6 text-white">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber">Work with me</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">{BUILDER.name}</h2>
      <p className="text-sm text-slate-300">{BUILDER.role}</p>
      <p className="mt-3 max-w-2xl text-sm text-slate-200">
        I built Stoop, and I build software like it for businesses in any industry. If you&apos;d like something
        like this for your own business, or want help with your website, booking or day-to-day busywork, let&apos;s talk.
      </p>
      <div className="mt-4">
        <ContactDetails light />
      </div>
      <div className="mt-5">
        <ContactButtons light />
      </div>
    </section>
  );
}
