import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card">
      <p>That contact doesn&apos;t exist or isn&apos;t in your workspace.</p>
      <Link href="/contacts" className="underline">Back to contacts</Link>
    </div>
  );
}
