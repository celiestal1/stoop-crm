"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { type ImportRow, phoneDigits } from "@/lib/contactImport";
import { CONTACT_TYPES, zonedToIso } from "@/lib/format";
import { getSession } from "@/lib/session";

const text = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v || null;
};
const num = (f: FormData, k: string) => {
  const v = text(f, k);
  if (!v) return null;
  const n = Number(v.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
};

// Error messages from the backend functions come back in the response body.
async function fnError(error: unknown) {
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === "function") {
    const body = await ctx.json().catch(() => null);
    if (body?.error) return String(body.error);
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

// ---------- contacts ----------
export async function addContact(formData: FormData) {
  const { supabase, orgId, user } = await getSession();
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      org_id: orgId,
      first_name: text(formData, "first_name"),
      last_name: text(formData, "last_name"),
      email: text(formData, "email"),
      phone: text(formData, "phone"),
      contact_type: text(formData, "contact_type") ?? "buyer",
      source: text(formData, "source") ?? "manual",
      assigned_to: user.id,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/contacts/${data.id}`);
}

const MAX_IMPORT = 5000;

// Adds contacts from an imported file, skipping anyone already in the workspace
// (same email or phone) and repeats within the file.
export async function importContacts(rows: ImportRow[], defaultType: string) {
  const { supabase, orgId, user } = await getSession();
  if (!Array.isArray(rows) || rows.length > MAX_IMPORT) {
    return { error: `Import up to ${MAX_IMPORT.toLocaleString()} contacts at a time.` };
  }
  const types = CONTACT_TYPES as readonly string[];
  const fallbackType = types.includes(defaultType) ? defaultType : "buyer";

  const { data: existing, error: readError } = await supabase
    .from("contacts")
    .select("email, phone")
    .eq("org_id", orgId)
    .limit(50000);
  if (readError) return { error: readError.message };
  const emails = new Set((existing ?? []).map((c) => c.email?.toLowerCase()).filter(Boolean));
  const phones = new Set((existing ?? []).map((c) => phoneDigits(c.phone)).filter((p) => p.length >= 7));

  const clean = (v: unknown, max = 500) => {
    const t = String(v ?? "").trim().slice(0, max);
    return t || null;
  };
  let skipped = 0;
  const inserts = [];
  for (const r of rows) {
    const email = clean(r.email, 320)?.toLowerCase() ?? null;
    const phone = clean(r.phone, 40);
    const digits = phoneDigits(phone);
    const first = clean(r.first_name, 100);
    const last = clean(r.last_name, 100);
    if (!first && !last && !email && !phone) continue;
    if ((email && emails.has(email)) || (digits.length >= 7 && phones.has(digits))) {
      skipped++;
      continue;
    }
    if (email) emails.add(email);
    if (digits.length >= 7) phones.add(digits);
    const type = clean(r.contact_type, 40)?.toLowerCase().replace(/[\s/&-]+/g, "_") ?? "";
    inserts.push({
      org_id: orgId,
      first_name: first,
      last_name: last,
      email,
      phone,
      contact_type: types.includes(type) ? type : fallbackType,
      source: clean(r.source, 100) ?? "import",
      notes: clean(r.notes, 5000),
      assigned_to: user.id,
    });
  }

  for (let i = 0; i < inserts.length; i += 500) {
    const { error } = await supabase.from("contacts").insert(inserts.slice(i, i + 500));
    if (error) {
      revalidatePath("/contacts");
      return { error: error.message, added: i, skipped };
    }
  }
  revalidatePath("/contacts");
  revalidatePath("/today");
  return { added: inserts.length, skipped };
}

export async function updateContact(id: string, formData: FormData) {
  const { supabase } = await getSession();
  const areas = text(formData, "preferred_areas");
  const { error } = await supabase
    .from("contacts")
    .update({
      first_name: text(formData, "first_name"),
      last_name: text(formData, "last_name"),
      email: text(formData, "email"),
      phone: text(formData, "phone"),
      contact_type: text(formData, "contact_type") ?? "buyer",
      status: text(formData, "status") ?? "new",
      source: text(formData, "source"),
      budget_min: num(formData, "budget_min"),
      budget_max: num(formData, "budget_max"),
      preferred_areas: areas ? areas.split(",").map((a) => a.trim()).filter(Boolean) : null,
      timeline: text(formData, "timeline"),
      pre_approved: formData.get("pre_approved") === "on",
      notes: text(formData, "notes"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/contacts/${id}`);
}

// Logs a call, text, note, showing or meeting. A call or text you made
// counts as a reply, so the contact leaves "Waiting on you".
export async function logActivity(contactId: string, formData: FormData) {
  const { supabase, orgId } = await getSession();
  const type = text(formData, "type") ?? "note";
  const body = text(formData, "body");
  if (!body) return;
  const { error } = await supabase.from("activities").insert({ org_id: orgId, contact_id: contactId, type, body });
  if (error) throw new Error(error.message);
  if (type === "call" || type === "text") {
    await supabase.from("contacts").update({ needs_reply: false }).eq("id", contactId);
    await supabase.from("contacts").update({ status: "contacted" }).eq("id", contactId).eq("status", "new");
  }
  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/today");
}

// Activity, tasks and messages go with the contact; their deals stay in the pipeline.
export async function deleteContact(contactId: string) {
  const { supabase } = await getSession();
  const { error } = await supabase.from("contacts").delete().eq("id", contactId);
  if (error) throw new Error(error.message);
  revalidatePath("/today");
  redirect("/contacts");
}

export async function markReplied(contactId: string) {
  const { supabase } = await getSession();
  await supabase.from("contacts").update({ needs_reply: false }).eq("id", contactId);
  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/today");
}

// ---------- tasks ----------
export async function addTask(formData: FormData) {
  const { supabase, orgId, user, org } = await getSession();
  const title = text(formData, "title");
  if (!title) return;
  const due = text(formData, "due_at");
  const contactId = text(formData, "contact_id");
  const { error } = await supabase.from("tasks").insert({
    org_id: orgId,
    title,
    contact_id: contactId,
    due_at: due ? zonedToIso(due, org.timezone || "America/New_York") : null,
    assigned_to: user.id,
  });
  if (error) throw new Error(error.message);
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/today");
}

export async function toggleTask(id: string, done: boolean) {
  const { supabase } = await getSession();
  await supabase.from("tasks").update({ done, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/today");
  revalidatePath("/contacts", "layout");
}

// ---------- AI + email ----------
export async function draftReply(contactId: string, channel: "email" | "sms", goal: string) {
  const { supabase } = await getSession();
  const { data, error } = await supabase.functions.invoke("ai", {
    body: { action: "draft_reply", contact_id: contactId, channel, goal: goal || undefined },
  });
  if (error) return { error: await fnError(error) };
  return { subject: (data?.subject as string) ?? "", body: (data?.body as string) ?? "" };
}

export async function sendEmail(contactId: string, subject: string, body: string) {
  const { supabase } = await getSession();
  const { error } = await supabase.functions.invoke("google/send", {
    body: { contact_id: contactId, subject, body },
  });
  if (error) return { error: await fnError(error) };
  revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/today");
  return { ok: true };
}

export async function scoreLead(contactId: string) {
  const { supabase } = await getSession();
  const { error } = await supabase.functions.invoke("ai", { body: { action: "score_lead", contact_id: contactId } });
  if (error) return { error: await fnError(error) };
  revalidatePath(`/contacts/${contactId}`);
  return { ok: true };
}

// ---------- deals ----------
export async function addDeal(formData: FormData) {
  const { supabase, orgId, user } = await getSession();
  const title = text(formData, "title");
  if (!title) return;
  let stageId = text(formData, "stage_id");
  if (!stageId) {
    const { data: first } = await supabase.from("pipeline_stages").select("id").order("position").limit(1).maybeSingle();
    stageId = first?.id ?? null;
  }
  const contactId = text(formData, "contact_id");
  const { error } = await supabase.from("deals").insert({
    org_id: orgId,
    title,
    deal_type: text(formData, "deal_type") ?? "buyer",
    contact_id: contactId,
    stage_id: stageId,
    price: num(formData, "price"),
    expected_close_date: text(formData, "expected_close_date"),
    assigned_to: user.id,
  });
  if (error) throw new Error(error.message);
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  revalidatePath("/pipeline");
  revalidatePath("/today");
}

export async function moveDeal(dealId: string, stageId: string) {
  const { supabase } = await getSession();
  const { data: stage } = await supabase.from("pipeline_stages").select("is_won").eq("id", stageId).maybeSingle();
  await supabase
    .from("deals")
    .update({ stage_id: stageId, closed_at: stage?.is_won ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
    .eq("id", dealId);
  revalidatePath("/pipeline");
  revalidatePath("/today");
}

export async function addDealDate(dealId: string, formData: FormData) {
  const { supabase, orgId } = await getSession();
  const labelText = text(formData, "label");
  const dueDate = text(formData, "due_date");
  if (!labelText || !dueDate) return;
  const { error } = await supabase.from("deal_dates").insert({ org_id: orgId, deal_id: dealId, label: labelText, due_date: dueDate });
  if (error) throw new Error(error.message);
  revalidatePath("/contacts", "layout");
  revalidatePath("/today");
}

export async function toggleDealDate(id: string, completed: boolean) {
  const { supabase } = await getSession();
  await supabase.from("deal_dates").update({ completed }).eq("id", id);
  revalidatePath("/today");
}

// ---------- listings ----------
export async function addListing(formData: FormData) {
  const { supabase, orgId } = await getSession();
  const address = text(formData, "address");
  if (!address) return;
  const { error } = await supabase.from("properties").insert({
    org_id: orgId,
    address,
    city: text(formData, "city"),
    state: text(formData, "state") ?? "NY",
    zip: text(formData, "zip"),
    list_price: num(formData, "list_price"),
    beds: num(formData, "beds"),
    baths: num(formData, "baths"),
    sqft: num(formData, "sqft"),
    property_type: text(formData, "property_type"),
    status: text(formData, "status") ?? "active",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/listings");
}

export async function describeListing(propertyId: string, notes: string) {
  const { supabase } = await getSession();
  const { data, error } = await supabase.functions.invoke("ai", {
    body: { action: "listing_description", property_id: propertyId, notes },
  });
  if (error) return { error: await fnError(error) };
  return { text: String(data?.text ?? "") };
}

export async function saveListingDescription(propertyId: string, description: string) {
  const { supabase } = await getSession();
  await supabase.from("properties").update({ description }).eq("id", propertyId);
  revalidatePath("/listings");
}

// ---------- settings ----------
export async function saveBusinessPhone(formData: FormData) {
  const { supabase, orgId, user } = await getSession();
  const { error } = await supabase.from("agent_settings").upsert({
    user_id: user.id,
    org_id: orgId,
    business_phone: text(formData, "business_phone"),
    business_phone_type: text(formData, "business_phone_type") ?? "cell",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function renameWorkspace(formData: FormData) {
  const { supabase, orgId } = await getSession();
  const name = text(formData, "name");
  if (!name) return;
  await supabase.from("organizations").update({ name }).eq("id", orgId);
  revalidatePath("/", "layout");
}

export async function startGoogle(returnTo: string) {
  const { supabase } = await getSession();
  const { data, error } = await supabase.functions.invoke("google/start", { body: { return_to: returnTo } });
  if (error) return { error: await fnError(error) };
  return { url: String(data?.url ?? "") };
}

export async function disconnectGoogle() {
  const { supabase } = await getSession();
  await supabase.functions.invoke("google/disconnect", { body: {} });
  revalidatePath("/settings");
}

export async function inviteAgent(formData: FormData) {
  const { supabase, orgId } = await getSession();
  const email = text(formData, "email");
  if (!email) return;
  const { error } = await supabase.from("invites").insert({ org_id: orgId, email, role: text(formData, "role") ?? "agent" });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}
