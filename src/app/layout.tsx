import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capital Circle — Private Business Opportunity Marketplace",
  description:
    "Capital Circle connects vetted investors, developers, entrepreneurs, land owners, suppliers, and business professionals on private deal flow you won't find anywhere else.",
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
        <Sidebar />
        <div className="md:pl-64 min-h-screen flex flex-col">
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
