"use client";

import { useState } from "react";

export function CopyBox({ value, rows = 1 }: { value: string; rows?: number }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* the text stays selectable */
    }
  };
  return (
    <div className="space-y-1">
      {rows > 1 ? (
        <textarea readOnly value={value} rows={rows} className="input font-mono text-xs" />
      ) : (
        <input readOnly value={value} className="input font-mono text-xs" />
      )}
      <button type="button" onClick={copy} className="text-xs font-semibold underline">
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
