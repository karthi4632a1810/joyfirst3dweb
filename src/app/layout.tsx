import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { site } from "@/data/site";
import { organisationJsonLd, websiteJsonLd } from "@/lib/seo";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  // Only the weights the design actually uses, so no unused font data ships.
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "JOYFIRST | Architecture & Interior Design",
    template: "%s | JOYFIRST",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  publisher: site.legalName,
  keywords: [
    "architecture Chennai",
    "interior design Chennai",
    "turnkey interior fit-out",
    "residential architecture Tamil Nadu",
    "commercial interior design India",
    "3D architectural visualisation",
    "JOYFIRST",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: "JOYFIRST | Architecture & Interior Design",
    description: site.description,
    images: [
      {
        url: "/images/og.jpg",
        width: 1200,
        height: 630,
        alt: "JOYFIRST — Architecture that feels like home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JOYFIRST | Architecture & Interior Design",
    description: site.description,
    images: ["/images/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/brand/favi.png", type: "image/png" }],
    apple: [{ url: "/brand/favi.png" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f8f6f2",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  // Zoom is left enabled — capping it fails WCAG 1.4.4.
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        {/*
          Scroll-reveal blocks start at opacity 0 and are animated in by GSAP.
          Without JavaScript nothing would ever reveal them, so the whole page
          would read as blank. This restores them.
        */}
        <noscript>
          <style>{`
            [data-reveal],
            [data-hero-meta],
            [data-page-transition] { opacity: 1 !important; transform: none !important; }
            .reveal-line > span { transform: none !important; opacity: 1 !important; }
          `}</style>
        </noscript>
      </head>
      <body className="bg-paper antialiased">
        <script
          type="application/ld+json"
          // Structured data is static and authored here, not user input.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organisationJsonLd(), websiteJsonLd()]),
          }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-[max(1.5rem,env(safe-area-inset-left))] focus:top-[max(1.5rem,env(safe-area-inset-top))] focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-[0.8125rem] focus:uppercase focus:tracking-[0.14em] focus:text-paper"
        >
          Skip to content
        </a>

        <SmoothScroll>
          <CustomCursor />
          <Navbar />
          <main id="main">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
