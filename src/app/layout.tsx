import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

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
  title: "Mobile Game Hunt",
  description: "Discover and showcase the best mobile games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Epunda+Slab:ital,wght@0,300..900;1,300..900&family=Orbitron:wght@400..900&family=Quantico:ital,wght@0,400;0,700;1,400;1,700&family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&family=Underdog&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${dmMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
