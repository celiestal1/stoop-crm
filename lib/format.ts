export type ContactName = { first_name?: string | null; last_name?: string | null };

export function fullName(c: ContactName | null | undefined) {
  if (!c) return "Unknown";
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || "Unnamed contact";
}

export function money(n: number | string | null | undefined) {
  if (n === null || n === undefined || n === "") return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(n));
}

export function when(iso: string | null | undefined, tz = "America/New_York") {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function day(date: string | null | undefined) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

export function label(s: string | null | undefined) {
  return (s ?? "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

// Digits for tel:/sms: links; keeps a leading +.
export function dialable(phone: string | null | undefined) {
  const p = (phone ?? "").trim();
  if (!p) return null;
  const digits = p.replace(/[^\d+]/g, "");
  return digits.length >= 7 ? digits : null;
}

export const CONTACT_TYPES = ["buyer", "seller", "buyer_seller", "investor", "renter", "past_client", "sphere", "vendor"] as const;
export const CONTACT_STATUSES = ["new", "contacted", "nurture", "active", "closed", "lost"] as const;
export const DEADLINES = [
  "Inspection",
  "Appraisal",
  "Financing / mortgage commitment",
  "Attorney review",
  "Final walkthrough",
  "Closing",
] as const;
export const PROPERTY_STATUSES = ["coming_soon", "active", "pending", "sold", "withdrawn"] as const;

// "2026-10-03T14:30" typed in the workspace's time zone, as a UTC ISO string.
export function zonedToIso(local: string, tz: string) {
  const asUtc = new Date(`${local}:00Z`);
  if (Number.isNaN(asUtc.getTime())) return null;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(asUtc)
      .map((p) => [p.type, p.value]),
  );
  const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(asUtc.getTime() - (shown - asUtc.getTime())).toISOString();
}
