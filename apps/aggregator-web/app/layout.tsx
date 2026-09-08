import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kabadiwala Connect - Urban Mining DPI",
  description: "Digital Public Infrastructure for Urban Mining, Secondary Metals & EPR",
};

import { AppProvider } from "@/context/AppContext";
import ToastBanner from "@/components/ToastBanner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="hi"
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased notranslate`}
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-ink-900 antialiased selection:bg-leaf-100 selection:text-leaf-900 notranslate">
        <AppProvider>
          <Navbar />
          <ToastBanner />
          <main className="flex-1 flex flex-col">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}

