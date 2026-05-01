import { Toaster } from "@/components/ui/sonner";
import { APP_DESCRIPTION, APP_Name, SERVER_URL } from "@/lib/constants";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_Name}`,
    default: APP_Name,
  },
  description: APP_DESCRIPTION,
  metadataBase: new URL(SERVER_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://utfs.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://utfs.io" />
        <link
          rel="preconnect"
          href="https://uploadthing.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://uploadthing.com" />
        <link
          rel="preconnect"
          href="https://5gvtqd14y1.ufs.sh"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://5gvtqd14y1.ufs.sh" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
        style={{ overflowX: "hidden" }}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <Toaster position="top-center" closeButton />
          {children}
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
