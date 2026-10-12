// The address and ready-made HTML form that send website inquiries into Stoop.
export function leadFormCode(leadKey: string) {
  const leadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/lead-intake?key=${leadKey}`;
  const formCode = `<form action="${leadUrl}" method="POST">
  <input name="name" placeholder="Your name" required>
  <input name="email" type="email" placeholder="Email">
  <input name="phone" placeholder="Phone">
  <input name="property" placeholder="Which property? (optional)">
  <textarea name="message" placeholder="How can I help?"></textarea>
  <input name="website_url" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Send</button>
</form>`;
  return { leadUrl, formCode };
}

export function agentLoginCode(origin: string) {
  return `<a href="${origin}/login">Agent login</a>`;
}
