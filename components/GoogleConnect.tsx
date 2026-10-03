"use client";

import { useState, useTransition } from "react";
import { disconnectGoogle, startGoogle } from "@/app/(crm)/actions";

export function GoogleConnect({ status, account }: { status: string | null; account: string | null }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const connect = () =>
    start(async () => {
      setError(null);
      const r = await startGoogle(`${window.location.origin}/settings`);
      if ("error" in r) setError(r.error ?? "Couldn't start Google sign-in.");
      else window.location.href = r.url;
    });

  return (
    <div className="space-y-2">
      {status === "connected" && <p className="text-sm">Connected as <strong>{account}</strong>. Client emails and calendar tasks sync automatically.</p>}
      {status === "error" && <p className="text-sm text-red-600">Your Google connection expired. Reconnect to keep emails coming in.</p>}
      {!status && <p className="text-sm text-slate-600">Connect Gmail and Google Calendar. Emails from your contacts and lead alerts from Zillow, Realtor.com and StreetEasy show up in Stoop.</p>}
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={connect} disabled={pending}>
          {status === "connected" ? "Reconnect Google" : status === "error" ? "Reconnect Google" : "Connect Google"}
        </button>
        {status && (
          <button className="btn-ghost" disabled={pending} onClick={() => start(() => disconnectGoogle())}>
            Disconnect
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
