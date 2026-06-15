import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-surface-200 dark:border-dashboard-border bg-surface-50/50 dark:bg-dashboard-bg-alt/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <BrandLogo size={24} />
              <span className="text-sm font-semibold text-surface-900 dark:text-dashboard-text-primary">
                EnoTools
              </span>
            </Link>
            <p className="text-xs text-surface-400 dark:text-dashboard-text-muted leading-relaxed max-w-xs">
              Free, fast, browser-based utilities for developers and creators.
              No signup required.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[11px] font-semibold text-surface-400 dark:text-dashboard-text-muted uppercase tracking-wider mb-4">
              Navigate
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/tools"
                  className="text-sm text-surface-500 dark:text-dashboard-text-secondary hover:text-surface-900 dark:hover:text-dashboard-text-primary transition-colors"
                >
                  All Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-surface-500 dark:text-dashboard-text-secondary hover:text-surface-900 dark:hover:text-dashboard-text-primary transition-colors"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-[11px] font-semibold text-surface-400 dark:text-dashboard-text-muted uppercase tracking-wider mb-4">
              Popular
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/tools/qr-code-generator", label: "QR Code Generator" },
                { href: "/tools/json-formatter", label: "JSON Formatter" },
                { href: "/tools/regex-tester", label: "Regex Tester" },
                { href: "/tools/base64", label: "Base64 Encoder" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-500 dark:text-dashboard-text-secondary hover:text-surface-900 dark:hover:text-dashboard-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[11px] font-semibold text-surface-400 dark:text-dashboard-text-muted uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/category/encoding", label: "Encoding" },
                { href: "/category/developer", label: "Developer" },
                { href: "/category/text", label: "Text" },
                { href: "/category/css", label: "CSS" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-surface-500 dark:text-dashboard-text-secondary hover:text-surface-900 dark:hover:text-dashboard-text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-surface-200 dark:border-dashboard-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-400 dark:text-dashboard-text-muted">
            &copy; {new Date().getFullYear()} EnoTools. All tools run locally in your browser.
          </p>
          <p className="text-xs text-surface-400 dark:text-dashboard-text-muted">
            Built with{" "}
            <span className="text-surface-500 dark:text-dashboard-text-secondary">Next.js</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
