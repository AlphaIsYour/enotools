import Link from "next/link";
import { Wrench, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Wrench className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">
                <span className="gradient-text">Eno</span>Tools
              </span>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400 max-w-xs">
              A modern collection of free, fast, and beautiful online utilities
              for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/tools"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  All Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Popular Tools
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/tools/qr-code-generator"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  QR Code Generator
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/json-formatter"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  JSON Formatter
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/regex-tester"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  Regex Tester
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/base64"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  Base64 Encoder
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-4">
              Categories
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/category/encoding"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  Encoding & Decoding
                </Link>
              </li>
              <li>
                <Link
                  href="/category/developer"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  Developer Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/category/text"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  Text Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/category/css"
                  className="text-sm text-surface-500 hover:text-brand-600 dark:text-surface-400 dark:hover:text-brand-400 transition-colors"
                >
                  CSS Tools
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            © {new Date().getFullYear()} EnoTools. All tools run locally in your
            browser.
          </p>
          <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> using Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
