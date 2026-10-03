"use client";

import { useState, useTransition } from "react";
import { draftReply, logActivity, sendEmail } from "@/app/(crm)/actions";

type Props = { contactId: string; email: string | null; phone: string | null; canEmail: boolean };

// Write (or draft with AI) an email sent from the agent's Gmail, or a text
// sent from the agent's own phone through its Messages app.
export function Composer({ contactId, email, phone, canEmail }: Props) {
  const [channel, setChannel] = useState<"email" | "sms">(email ? "email" : "sms");
  const [goal, setGoal] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const draft = () =>
    start(async () => {
      setMsg(null);
      const r = await draftReply(contactId, channel, goal);
      if ("error" in r) return setMsg({ ok: false, text: r.error ?? "AI couldn't write a draft." });
      if (channel === "email") setSubject(r.subject);
      setBody(r.body);
    });

  const send = () =>
    start(async () => {
      setMsg(null);
      const r = await sendEmail(contactId, subject, body);
      if ("error" in r) return setMsg({ ok: false, text: r.error ?? "Couldn't send." });
      setSubject("");
      setBody("");
      setMsg({ ok: true, text: "Sent from your Gmail." });
    });

  const logText = () =>
    start(async () => {
      const f = new FormData();
      f.set("type", "text");
      f.set("body", `You texted them: ${body}`);
      await logActivity(contactId, f);
      setBody("");
      setMsg({ ok: true, text: "Text logged." });
    });

  // iOS and macOS expect "sms:number&body=", everything else "sms:number?body=".
  const openMessages = () => {
    if (!phone) return;
    const sep = /iPhone|iPad|Macintosh/.test(navigator.userAgent) ? "&" : "?";
    window.location.href = `sms:${phone}${sep}body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="card space-y-3">
      <div className="flex gap-2">
        <button className={channel === "email" ? "btn-primary" : "btn-ghost"} onClick={() => setChannel("email")} disabled={!email}>
          Email
        </button>
        <button className={channel === "sms" ? "btn-primary" : "btn-ghost"} onClick={() => setChannel("sms")} disabled={!phone}>
          Text
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What should the reply do? (optional)" className="input flex-1" />
        <button className="btn-amber" onClick={draft} disabled={pending}>
          {pending ? "Working…" : "Draft with AI"}
        </button>
      </div>

      {channel === "email" && (
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="input" />
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={channel === "email" ? 7 : 3}
        placeholder={channel === "email" ? "Write your email" : "Write your text"}
        className="input"
      />

      {channel === "email" ? (
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" onClick={send} disabled={pending || !body || !canEmail}>
            Send from Gmail
          </button>
          {!canEmail && <span className="text-xs text-slate-500">Connect Google in Settings to send email.</span>}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" onClick={openMessages} disabled={!body}>
            Open in Messages
          </button>
          <button className="btn-ghost" onClick={logText} disabled={pending || !body}>
            Log as sent
          </button>
          <span className="text-xs text-slate-500">Texts go from your own phone and number.</span>
        </div>
      )}

      {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}
