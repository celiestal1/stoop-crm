// The person who builds and supports Stoop, shown on the homepage and in the CRM.
export const BUILDER = {
  name: "William Arjmandpour",
  role: "Software builder · Fordham University student",
  email: "williamarjmand@gmail.com",
  phone: "+1 (737) 770-9797",
  phoneHref: "tel:+17377709797",
};

export const CALL_HREF = `mailto:${BUILDER.email}?subject=${encodeURIComponent(
  "Let's set up a call",
)}&body=${encodeURIComponent("Hi William,\n\nI'd like to set up a quick call. Times that work for me:\n\n")}`;

export const CLIENT_HREF = `mailto:${BUILDER.email}?subject=${encodeURIComponent(
  "Becoming a client",
)}&body=${encodeURIComponent("Hi William,\n\nI'm interested in working with you. A bit about my business and what I'd like help with:\n\n")}`;

export const SERVICES = [
  {
    title: "Custom CRMs and dashboards",
    body: "A system built around how your business actually works, like this one: clients, deals, tasks and deadlines in one place, with a Today screen that shows what needs you.",
  },
  {
    title: "Websites and online booking",
    body: "A clean, fast website with forms that turn visitors into leads, plus booking and sign-up that customers can finish on their phone without calling.",
  },
  {
    title: "Automations that save hours",
    body: "Automatic follow-ups, reminders and confirmations by email or text, so nothing slips and nobody on your team has to remember to chase it.",
  },
  {
    title: "AI tools for your team",
    body: "Replies drafted from the whole conversation, summaries of long email threads, lead scoring and listing or product descriptions, always reviewed by you before anything is sent.",
  },
  {
    title: "Connecting the tools you already use",
    body: "Gmail, Google Calendar, spreadsheets, lead sites and payment tools wired together, so information flows on its own instead of being copied by hand.",
  },
  {
    title: "Data cleanup, trackers and reports",
    body: "Contacts and records imported from Excel, Google or your phone, duplicates cleaned up, and simple trackers and reports that show how the business is doing.",
  },
];

export const STEPS = [
  { title: "A 15-minute call", body: "You tell me what takes up the most time or what you'd like to improve." },
  { title: "A clear plan", body: "I suggest a few ideas and we agree on the scope and price up front, so there are no surprises." },
  { title: "Built in short rounds", body: "You see working pieces early and can change direction as we go." },
  { title: "Setup and support", body: "I move your data in, train you and your team, and stay on call when something needs fixing." },
];
