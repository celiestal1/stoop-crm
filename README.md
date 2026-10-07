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
- `/contacts/import`: bring in contacts from a CSV (Excel, Google Contacts) or vCard (iPhone), skipping anyone already in the workspace.
- `/contacts` and `/contacts/[id]`: search, add, edit; email from Gmail or text from your own phone, with Draft with AI; log calls, texts and notes; tasks; lead score.
- `/pipeline`: drag deals between stages (a stage menu on phones).
- `/listings`: listings with AI-written descriptions.
- `/settings`: Google connection, your business phone number, the website lead form, team invite links.
- `/invite/[token]`: accept a team invite.
- `/privacy` and `/terms`: public legal pages (Google's consent screen links to the privacy policy).

## Backend

The database, Row Level Security and backend functions live in Supabase. The app calls:

- `ai`: lead score, reply drafts, listing descriptions.
- `google`: connect, sync, send email.
- `lead-intake`: public lead capture used by the website form.

`supabase/migrations/` holds schema changes made from this repo. `20261003000000_agent_settings.sql` (already applied) stores each agent's business phone.

Calls and texts use the agent's own phone and number; Stoop does not provide phone numbers.

## Deploy

Deploy to Vercel with the two variables from `.env.example`, then add the Vercel URL to Supabase → Authentication → URL Configuration (Site URL and redirect URLs, including `/auth/callback`).
