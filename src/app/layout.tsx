import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://enotools.dev"),
  title: {
    default: "EnoTools — 80+ Free Developer & Productivity Tools",
    template: "%s | EnoTools",
  },
  description:
    "A modern workspace with 80+ free, fast, browser-based tools for PDF, image, encoding, text, developer, and productivity tasks.",
  keywords: [
    "developer tools", "online utilities", "QR code generator", "JSON formatter",
    "regex tester", "PDF tools", "image tools", "free tools",
  ],
  authors: [{ name: "EnoTools" }],
  creator: "EnoTools",
  icons: {
    icon: [{ url: "/enotools.png", type: "image/png", sizes: "961x961" }],
    shortcut: "/enotools.png",
    apple: [{ url: "/enotools.png", type: "image/png", sizes: "961x961" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://enotools.dev",
    siteName: "EnoTools",
    title: "EnoTools — 80+ Free Developer & Productivity Tools",
    description: "A modern workspace with 80+ free, fast, browser-based tools.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "EnoTools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EnoTools — 80+ Free Developer & Productivity Tools",
    description: "A modern workspace with 80+ free, fast, browser-based tools.",
    images: ["/og.svg"],
  },
  robots: { index: true, follow: true },
};

const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })()
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
