import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of Service · Stoop" };

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="October 7, 2026">
      <p>
        These terms are an agreement between you and Stoop (&quot;we&quot;, &quot;us&quot;) for using the Stoop CRM.
        By creating an account you agree to them. If you use Stoop for a brokerage or team, you agree on its behalf.
      </p>

      <h2>Your account</h2>
      <p>
        Keep your password private and tell us right away if you think someone else has used your account. You are
        responsible for what happens in your account and for the people you invite to your workspace.
      </p>

      <h2>Your data</h2>
      <p>
        You own the data you put into Stoop. You give us permission to store and process it only to run the service
        for you, as described in our <Link href="/privacy">Privacy Policy</Link>. You can export or delete it at any time.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Follow the law, including fair housing, anti-spam (CAN-SPAM) and telemarketing (TCPA) rules.</li>
        <li>Only contact people you have a right to contact, and honor requests to stop.</li>
        <li>Do not try to break into, overload or copy the service.</li>
      </ul>

      <h2>AI features</h2>
      <p>
        AI drafts, summaries and scores can be wrong. Review anything AI writes before you send or rely on it. You are
        responsible for the messages you send.
      </p>

      <h2>Pilots, fees and cancellation</h2>
      <p>
        Free pilots last for the period we agree with you in writing. After that, fees are as quoted to you and billed in
        advance each month. You can cancel at any time and keep access until the end of the paid period. Fees already
        paid are not refunded unless the law requires it.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We work to keep Stoop running and your data safe, but the service is provided &quot;as is&quot; without
        guarantees that it will always be available or error free. We may improve or change features over time and
        will tell you before removing something you rely on.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, Stoop is not liable for indirect or lost-profit damages, and our total liability
        is limited to the fees you paid in the 12 months before the claim.
      </p>

      <h2>Ending the agreement</h2>
      <p>
        You can stop using Stoop at any time. We may suspend accounts that break these terms. When an account closes,
        we delete its data as described in the Privacy Policy.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of New York.</p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:hello@stoopcrm.com">hello@stoopcrm.com</a>
      </p>
    </LegalPage>
  );
}
