import type { Metadata } from "next";
import { DM_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { generateOrganizationJsonLd } from "@/lib/seo";
import { FALLBACK_OG_IMAGE, getSiteBaseUrl, toAbsoluteUrl } from "@/lib/image-utils";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "@/lib/jobs/registerNewsletterCron";
import "@/lib/jobs/registerGameOfDayCron";
// SECURITY: Validate environment variables on startup
import "@/lib/env-validation";

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const SITE_URL = getSiteBaseUrl();
const DEFAULT_OG_IMAGE = toAbsoluteUrl(FALLBACK_OG_IMAGE);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mobile Game Hunt - Discover the Best Mobile Games",
  description: "Discover and showcase the best mobile games. Connect with developers, share your favorites and stay updated with the latest releases in mobile gaming.",
  keywords: "mobile games, app discovery, game reviews, mobile gaming, indie games, game developers",
  authors: [{ name: "Mobile Game Hunt" }],
  creator: "Mobile Game Hunt",
  publisher: "Mobile Game Hunt",
  robots: "index, follow",
  icons: {
    icon: "/logo/mgh.png",
    apple: "/logo/mgh.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Mobile Game Hunt",
    title: "Mobile Game Hunt - Discover the Best Mobile Games",
    description: "Discover and showcase the best mobile games. Connect with developers, share your favorites and stay updated with the latest releases in mobile gaming.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Mobile Game Hunt - Discover the Best Mobile Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mobilegamehunt",
    creator: "@mobilegamehunt",
    title: "Mobile Game Hunt - Discover the Best Mobile Games",
    description: "Discover and showcase the best mobile games. Connect with developers, share your favorites and stay updated with the latest releases in mobile gaming.",
    images: [DEFAULT_OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = generateOrganizationJsonLd();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance: Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Performance: Async font loading */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body
        className={`${dmMono.variable} ${orbitron.variable} antialiased dark`}
      >
        <GoogleAnalytics />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
