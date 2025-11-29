import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SWRProvider } from "@/components/providers/SWRProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuickServe | QR Ordering Platform",
  description:
    "Smart QR-based ordering platform for hotels and restaurants with real-time dashboards, analytics, and review capture.",
  metadataBase: new URL("https://agentic-83c12b38.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 antialiased`}>
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}
