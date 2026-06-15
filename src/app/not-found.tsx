import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "var(--app-bg)" }}>
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border-soft)" }}>
          <span className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>404</span>
        </div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-main)" }}>Page not found</h1>
        <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary text-sm">
            <Home className="h-3.5 w-3.5" /> Go Home
          </Link>
          <Link href="/dashboard" className="btn-secondary text-sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
