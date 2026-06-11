import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-extrabold gradient-text">404</p>
        <h1 className="mt-4 text-2xl font-bold text-surface-900 dark:text-surface-100">
          Page not found
        </h1>
        <p className="mt-2 text-surface-500 dark:text-surface-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <Link href="/tools" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Browse Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
