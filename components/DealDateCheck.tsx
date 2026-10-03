"use client";

import { useTransition } from "react";
import { toggleDealDate } from "@/app/(crm)/actions";

export function DealDateCheck({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      className="h-4 w-4 accent-navy"
      disabled={pending}
      onChange={(e) => start(() => toggleDealDate(id, e.target.checked))}
      aria-label="Mark complete"
    />
  );
}
