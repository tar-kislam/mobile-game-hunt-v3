import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { generateOrganizationJsonLd } from "@/lib/seo";

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

// Load Underdog font from Google Fonts
const underdogFont = {
  fontFamily: '"Underdog", cursive',
};

// TASA Explorer will be loaded via CSS import since it's not available in next/font/google

export const metadata: Metadata = {
  title: "Mobile Game Hunt - Discover the Best Mobile Games",
  description: "Discover and showcase the best mobile games and apps. Connect with developers, share your favorites, and stay updated with the latest releases in mobile gaming.",
  keywords: "mobile games, app discovery, game reviews, mobile gaming, indie games, game developers",
  authors: [{ name: "Mobile Game Hunt" }],
  creator: "Mobile Game Hunt",
  publisher: "Mobile Game Hunt",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://mobilegamehunt.com",
    siteName: "Mobile Game Hunt",
    title: "Mobile Game Hunt - Discover the Best Mobile Games",
    description: "Discover and showcase the best mobile games and apps. Connect with developers, share your favorites, and stay updated with the latest releases in mobile gaming.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://mobilegamehunt.com"}/logo/mgh.png`,
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
    description: "Discover and showcase the best mobile games and apps. Connect with developers, share your favorites, and stay updated with the latest releases in mobile gaming.",
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || "https://mobilegamehunt.com"}/logo/mgh.png`],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || "https://mobilegamehunt.com",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Epunda+Slab:ital,wght@0,300..900;1,300..900&family=Orbitron:wght@400..900&family=Quantico:ital,wght@0,400;0,700;1,400;1,700&family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Underdog&display=swap" 
          rel="stylesheet" 
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body
        className={`${dmMono.variable} antialiased dark`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
