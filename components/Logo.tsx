// Brownstone steps leading up to a lit doorway, plus the "stoop" wordmark.
export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const ink = light ? "#FFFFFF" : "#14213D";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="11" y="3" width="10" height="15" rx="5" fill="#F4B23E" />
        <rect x="8" y="19" width="16" height="3" fill={ink} />
        <rect x="5" y="23" width="22" height="3" fill={ink} />
        <rect x="2" y="27" width="28" height="3" fill={ink} />
      </svg>
      <span className="font-display text-xl font-bold lowercase tracking-tight" style={{ color: ink }}>
        stoop
      </span>
    </span>
  );
}
