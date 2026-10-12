"use client";

import { useOptimistic, useTransition } from "react";
import { setLeadAlerts } from "@/app/(crm)/actions";

export function LeadAlertsToggle({ on }: { on: boolean }) {
  const [, start] = useTransition();
  const [value, set] = useOptimistic(on);
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => {
          const next = e.target.checked;
          start(async () => {
            set(next);
            await setLeadAlerts(next);
          });
        }}
      />
      Email me in Gmail every time someone sends an inquiry from my website
    </label>
  );
}
