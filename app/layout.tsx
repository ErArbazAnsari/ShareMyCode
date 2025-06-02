import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://sharemycode.vercel.app'),
  title: {
    default: "ShareMyCode - Share and Discover Code Snippets",
    template: "%s | ShareMyCode"
  },
  description: "A modern platform for sharing, discovering, and collaborating on code snippets. Share your code with the world, find solutions, and learn from other developers.",
  keywords: ["code sharing", "code snippets", "programming", "developer tools", "code collaboration", "github gist alternative", "code repository", "code examples", "programming help", "developer community"],
  authors: [{ name: "ShareMyCode Team" }],
  creator: "ShareMyCode",
  publisher: "ShareMyCode",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sharemycode.vercel.app",
    title: "ShareMyCode - Share and Discover Code Snippets",
    description: "A modern platform for sharing, discovering, and collaborating on code snippets. Share your code with the world, find solutions, and learn from other developers.",
    siteName: "ShareMyCode",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ShareMyCode - Code Sharing Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ShareMyCode - Share and Discover Code Snippets",
    description: "A modern platform for sharing, discovering, and collaborating on code snippets. Share your code with the world, find solutions, and learn from other developers.",
    images: ["/og-image.png"],
    creator: "@sharemycode"
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
  verification: {
    google: "your-google-site-verification",
  },
  alternates: {
    canonical: "https://sharemycode.vercel.app",
  },
  category: "technology",
  classification: "Code Sharing Platform",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="application-name" content="ShareMyCode" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="ShareMyCode" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#ffffff" />
          <meta name="msapplication-tap-highlight" content="no" />
        </head>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="min-h-screen bg-background">
              <Navbar />
              <main className="container mx-auto px-4 py-8">{children}</main>
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
