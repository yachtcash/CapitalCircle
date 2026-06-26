import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { MessagingProvider } from "@/components/providers/MessagingProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Capital Circle";
const SITE_DESCRIPTION =
  "Capital Circle connects vetted investors, developers, entrepreneurs, land owners, suppliers, and business professionals on private deal flow you won't find anywhere else.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capitalcircle.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Private Business Opportunity Marketplace`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "private deal flow",
    "investment opportunities",
    "joint ventures",
    "real estate development",
    "business acquisitions",
    "private marketplace",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Private Business Opportunity Marketplace`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Where serious capital meets real opportunity.`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Private Business Opportunity Marketplace`,
    description: SITE_DESCRIPTION,
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1628",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-navy-900">
        <MessagingProvider>
          <Sidebar />
          <div className="md:pl-64 min-h-screen flex flex-col">
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
          </div>
          <BottomNav />
        </MessagingProvider>
      </body>
    </html>
  );
}
