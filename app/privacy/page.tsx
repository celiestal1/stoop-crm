import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy · Stoop" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="October 7, 2026">
      <p>
        Stoop (&quot;we&quot;, &quot;us&quot;) makes a CRM for real estate agents. This policy explains what information
        Stoop collects, how we use it, and the choices you have. Questions go to{" "}
        <a href="mailto:hello@stoopcrm.com">hello@stoopcrm.com</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address and password (stored hashed by our sign-in provider).</li>
        <li>
          Workspace data you add or import: contacts, notes, tasks, deals, listings, your business phone number and
          activity you log.
        </li>
        <li>Leads submitted through your website lead form.</li>
        <li>
          Google data, only if you connect your Google account: the email messages exchanged with your contacts, and
          calendar events you create from Stoop.
        </li>
        <li>Basic technical data such as browser type and error logs, used to keep the service running.</li>
      </ul>

      <h2>How we use Google user data</h2>
      <p>When you connect Google, Stoop asks for permission to:</p>
      <ul>
        <li>Read Gmail messages, so emails with your contacts appear on their timeline and new leads from sites like Zillow are added automatically.</li>
        <li>Send email from your Gmail account, only when you press Send in Stoop.</li>
        <li>Create and update calendar events, such as showings and deadlines you schedule in Stoop.</li>
      </ul>
      <p>
        Stoop&apos;s use and transfer of information received from Google APIs adheres to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer">
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. We use Google data only to provide the features above to you. We do
        not sell it, do not use it for advertising, and do not use it to train general AI models. People at Stoop do
        not read your Google data unless you ask us to for support, it is needed for security, or the law requires it.
      </p>
      <p>
        You can disconnect Google at any time in Stoop under Settings, or from your Google account&apos;s security
        page. Disconnecting stops all access and deletes the stored Google tokens.
      </p>

      <h2>AI features</h2>
      <p>
        Features such as reply drafts, email summaries, lead scores and listing descriptions send the relevant text to
        our AI provider (Anthropic) to produce a result. The provider processes it on our behalf and does not use it to
        train its models.
      </p>

      <h2>Who we share data with</h2>
      <p>We do not sell your data. We share it only with providers that run Stoop for us:</p>
      <ul>
        <li>Supabase (database, sign-in and file storage)</li>
        <li>Vercel (website hosting)</li>
        <li>Anthropic (AI features)</li>
        <li>Google (only when you connect your account)</li>
      </ul>
      <p>We may also disclose data if the law requires it.</p>

      <h2>Your workspace and your clients&apos; data</h2>
      <p>
        Each brokerage or team has its own workspace, and only its members can see its data. You decide what contact
        information goes into Stoop and are responsible for having the right to store and contact those people.
      </p>

      <h2>Security and retention</h2>
      <p>
        Data is encrypted in transit and at rest, and access is limited by workspace. We keep your data while your
        account is active. If you close your account, we delete your workspace data within 30 days, except where the
        law requires us to keep it.
      </p>

      <h2>Your choices</h2>
      <p>
        You can view, edit, export or delete your contacts in Stoop at any time. To get a copy of your data or close
        your account, email <a href="mailto:hello@stoopcrm.com">hello@stoopcrm.com</a>.
      </p>

      <h2>Children</h2>
      <p>Stoop is a business tool and is not meant for anyone under 18.</p>

      <h2>Changes</h2>
      <p>If we change this policy in a meaningful way, we will tell you by email or in the app before it takes effect.</p>
    </LegalPage>
  );
}
