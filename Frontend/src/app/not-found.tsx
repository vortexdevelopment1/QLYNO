import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow mb-2">404</p>
      <h1 className="font-display text-2xl text-ink mb-2">We couldn&apos;t find that page</h1>
      <p className="text-sm text-ink-muted mb-5">The record or page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/doctor/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
