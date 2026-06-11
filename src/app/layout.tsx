import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://enotools.dev"),
  title: {
    default: "EnoTools — All-in-One Developer & Productivity Toolkit",
    template: "%s | EnoTools",
  },
  description:
    "A modern collection of free, fast, and beautiful online utilities for developers, designers, students, and office workers. QR codes, JSON formatting, regex testing, encoding, and more.",
  keywords: [
    "developer tools",
    "online utilities",
    "QR code generator",
    "JSON formatter",
    "regex tester",
    "base64",
    "hash generator",
    "JWT decoder",
    "CSS generator",
    "text tools",
    "free tools",
  ],
  authors: [{ name: "EnoTools" }],
  creator: "EnoTools",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://enotools.dev",
    siteName: "EnoTools",
    title: "EnoTools — All-in-One Developer & Productivity Toolkit",
    description:
      "A modern collection of free, fast, and beautiful online utilities for developers, designers, students, and office workers.",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "EnoTools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EnoTools — All-in-One Developer & Productivity Toolkit",
    description:
      "A modern collection of free, fast, and beautiful online utilities.",
    images: ["/og.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
