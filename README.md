# Stoop

A CRM for real estate agents and small teams. Marketing site at `/`, the CRM behind `/login`.

Built with Next.js 15 (App Router), Tailwind 4 and Supabase (project `bahakkpwtrtvdhuqndus`).

## Run it locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000, create an account, and name your workspace.

## What's here

- `/today`: who is waiting on a reply, tasks due, contract deadlines, pipeline totals, and a Reconnect Google alert.
- `/contacts/import`: bring in contacts from Excel (.xlsx), a CSV (Google Contacts, other CRMs) or vCard (iPhone), skipping anyone already in the workspace.
- `/contacts` and `/contacts/[id]`: search, add, edit; email from Gmail or text from your own phone, with Draft with AI; log calls, texts and notes; tasks; lead score.
- `/pipeline`: drag deals between stages (a stage menu on phones).
- `/listings`: listings with AI-written descriptions, plus bulk import: paste a link (a listing or a whole listings page), paste text, or upload a spreadsheet, and AI pulls out each property for review.
- `/connect`: Connect your website: save the agency's site, import its listings, copy the Agent login link and contact form for the site, connect Gmail and turn on inquiry alerts. New workspaces land here after onboarding.
- `/settings`: country (United States or Japan: currency, time zone and listing labels), Google connection, your business phone number, the website lead form, team invite links.
- `/invite/[token]`: accept a team invite.
- `/privacy` and `/terms`: public legal pages (Google's consent screen links to the privacy policy).

## Backend

The database, Row Level Security and backend functions live in Supabase. The app calls:

- `ai`: lead score, reply drafts, listing descriptions, listing extraction (`extract_listings`).
- `google`: connect, sync, send email.
- `lead-intake`: public lead capture used by the website form; emails the agent from their own Gmail when `organizations.lead_alerts` is on.

`supabase/migrations/` holds schema changes made from this repo. `20261003000000_agent_settings.sql` (already applied) stores each agent's business phone.

Calls and texts use the agent's own phone and number; Stoop does not provide phone numbers.

## Deploy

Deploy to Vercel with the two variables from `.env.example`, then add the Vercel URL to Supabase → Authentication → URL Configuration (Site URL and redirect URLs, including `/auth/callback`).
