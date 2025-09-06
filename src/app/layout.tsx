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
  title: {
    default: "Christopher Olsen - Cell & Biochemical Assay Scientist | Chris Olsen Portfolio",
    template: "%s | Christopher Olsen"
  },
  description: "Christopher Olsen (Chris Olsen) - Cell & Biochemical Assay Scientist with 6+ years experience in assay development, Python coding, and biotech research. Interactive AI-powered portfolio showcasing projects and expertise.",
  keywords: [
    "Christopher Olsen",
    "Chris Olsen",
    "Cell Assay Scientist",
    "Biochemical Assay",
    "Biotech Scientist",
    "Python Developer",
    "Assay Development",
    "Bench Automation",
    "Primary Cell Culture",
    "Therapeutics Research",
    "Boston University",
    "colsen-bu"
  ],
  authors: [{ name: "Christopher Olsen" }],
  creator: "Christopher Olsen",
  publisher: "Christopher Olsen",
  metadataBase: new URL('https://chrisolsen.work'),
  alternates: {
    canonical: "https://chrisolsen.work"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    title: "Christopher Olsen - Cell & Biochemical Assay Scientist",
    description: "Christopher Olsen (Chris Olsen) - Experienced Cell & Biochemical Assay Scientist specializing in assay development, Python coding, and biotech research. Explore my interactive portfolio.",
    type: "website",
    siteName: "Christopher Olsen Portfolio",
    url: "https://chrisolsen.work",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Christopher Olsen - Cell & Biochemical Assay Scientist Portfolio"
      }
    ],
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Christopher Olsen - Cell & Biochemical Assay Scientist",
    description: "Christopher Olsen (Chris Olsen) - Interactive portfolio showcasing expertise in cell assays, biotech research, and Python development.",
    creator: "@christopherolsen",
    images: ["/og.png"]
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Christopher Olsen",
    "alternateName": "Chris Olsen",
    "jobTitle": "Cell & Biochemical Assay Scientist",
    "description": "Cell and biochemical assay Scientist with 6+ years of experience in assay development and screening. Expertise in bench automation, Python coding, and primary cell culture.",
    "url": "https://chrisolsen.work",
    "sameAs": [
      "https://linkedin.com/in/colsen-bu",
      "https://github.com/colsen-bu"
    ],
    "knowsAbout": [
      "Cell Assay Development",
      "Biochemical Assays",
      "Python Programming",
      "Bench Automation",
      "Primary Cell Culture",
      "Therapeutics Research",
      "Biotech Research"
    ],
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "Boston University"
    },
    "email": "colsen@mcvcllmhgb.com",
    "telephone": "617-922-9615"
  };

  return (
    <html lang="en" suppressHydrationWarning className={mono.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
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
