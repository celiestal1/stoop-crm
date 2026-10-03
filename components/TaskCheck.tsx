"use client";

import { useTransition } from "react";
import { toggleTask } from "@/app/(crm)/actions";

export function TaskCheck({ id, done }: { id: string; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <input
      type="checkbox"
      className="h-4 w-4 accent-navy"
      defaultChecked={done}
      disabled={pending}
      onChange={(e) => start(() => toggleTask(id, e.target.checked))}
      aria-label="Mark done"
    />
  );
}
