"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { moveDeal } from "@/app/(crm)/actions";
import { money } from "@/lib/format";

type Stage = { id: string; name: string };
type Deal = { id: string; title: string; price: number | null; stage_id: string | null; contact_id: string | null; contact_name: string | null; deal_type: string };

export function PipelineBoard({ stages, deals }: { stages: Stage[]; deals: Deal[] }) {
  const [, start] = useTransition();
  const [board, move] = useOptimistic(deals, (state, { id, stageId }: { id: string; stageId: string }) =>
    state.map((d) => (d.id === id ? { ...d, stage_id: stageId } : d)),
  );

  const drop = (stageId: string, e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    start(async () => {
      move({ id, stageId });
      await moveDeal(id, stageId);
    });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((s) => {
        const inStage = board.filter((d) => d.stage_id === s.id);
        const total = inStage.reduce((a, d) => a + Number(d.price ?? 0), 0);
        return (
          <div
            key={s.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => drop(s.id, e)}
            className="w-64 shrink-0 rounded-xl bg-slate-100 p-3"
          >
            <div className="mb-3">
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="text-xs text-slate-500">
                {inStage.length} · {money(total) || "$0"}
              </p>
            </div>
            <div className="min-h-16 space-y-2">
              {inStage.map((d) => (
                <div
                  key={d.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", d.id)}
                  className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm active:cursor-grabbing"
                >
                  <p className="font-medium">{d.title}</p>
                  <p className="text-xs text-slate-500">
                    {d.deal_type === "listing" ? "Listing" : "Buyer"} · {money(d.price)}
                  </p>
                  {d.contact_id && (
                    <Link href={`/contacts/${d.contact_id}`} className="text-xs underline">
                      {d.contact_name}
                    </Link>
                  )}
                  <select
                    aria-label="Move to stage"
                    value={d.stage_id ?? ""}
                    onChange={(e) => {
                      const stageId = e.target.value;
                      start(async () => {
                        move({ id: d.id, stageId });
                        await moveDeal(d.id, stageId);
                      });
                    }}
                    className="mt-2 w-full rounded border border-slate-200 bg-white px-1 py-0.5 text-xs md:hidden"
                  >
                    {stages.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
