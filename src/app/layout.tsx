import { Playfair_Display, Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { getSiteUrl, siteInfo } from "@/lib/api";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteInfo.name} | ${siteInfo.tagline}`,
    template: `%s | ${siteInfo.name}`,
  },
  description:
    "Premium solid wood furniture crafted to order. Sofas, beds, dining sets and more from Woodcastle.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: siteInfo.name,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
