import type { Metadata } from "next";
import { JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import ThemeProvider from '@/components/providers/ThemeProvider';
import { Analytics } from "@vercel/analytics/react";

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "Christopher Olsen",
  description: "Interactive portfolio with AI-powered chat",
  metadataBase: new URL('https://chrisolsen.work'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png' }
    ]
  },
  openGraph: {
    title: "Christopher Olsen",
    description: "Interactive portfolio with AI-powered chat",
    type: "website",
    siteName: "Christopher Olsen"
  },
  twitter: {
    card: "summary_large_image",
    title: "Christopher Olsen",
    description: "Interactive portfolio with AI-powered chat",
    creator: "@christopherolsen"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={mono.variable}>
      <body className={`${mono.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <main className="min-h-screen">
            {children}
            <Analytics />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
