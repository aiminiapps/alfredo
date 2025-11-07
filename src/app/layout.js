import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO Configuration
const siteConfig = {
  name: "Alfredo AI",
  title: "Alfredo AI - AI-Powered Crypto Portfolio Analysis | BSC Blockchain",
  description: "Analyze your crypto portfolio with AI-powered insights. Get real-time portfolio analytics, risk assessment, and earn AFRD tokens by completing simple tasks on BNB Smart Chain.",
  url: "https://www.alfredo.world", 
  ogImage: "https://www.alfredo.world/og-image.png",
  keywords: [
    "crypto portfolio analysis",
    "AI crypto analytics",
    "blockchain portfolio tracker",
    "BSC tokens",
    "AFRD token",
    "crypto rewards",
    "portfolio AI",
    "DeFi analytics",
    "crypto task rewards",
    "BNB Smart Chain",
    "Web3 analytics",
    "crypto insights",
    "portfolio optimization",
    "blockchain rewards"
  ],
  creator: "Alfredo AI Team",
  publisher: "Alfredo",
  category: "Cryptocurrency & Blockchain",
  twitterHandle: "@Alfredo_AI",
  locale: "en_US"
};

export const metadata = {
  // Basic Metadata
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  category: siteConfig.category,

  // Alternate Links
  alternates: {
    canonical: siteConfig.url,
    languages: {
      'en-US': siteConfig.url,
      'en': siteConfig.url
    }
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: '/icon.png', sizes: 'any' },
      { url: '/icon.png', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: [
      { url: '/icon.png' },
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icon.png',
      },
    ],
  },

  // Manifest
  manifest: '/manifest.json',

  // Open Graph
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - AI-Powered Crypto Portfolio Analysis`,
        type: 'image/jpeg',
      },
      {
        url: `${siteConfig.url}/og-image-square.jpg`,
        width: 1200,
        height: 1200,
        alt: `${siteConfig.name} Square Logo`,
        type: 'image/jpeg',
      }
    ],
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [siteConfig.ogImage],
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: 'black-translucent',
  },

  // Format Detection
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  // Other
  other: {
    'application-name': siteConfig.name,
    'mobile-web-app-capable': 'yes',
    'theme-color': '#FF8C00',
    'color-scheme': 'dark light',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF8C00' },
    { media: '(prefers-color-scheme: dark)', color: '#0D0A07' }
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO Tags */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Additional Schema.org markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": siteConfig.name,
              "description": siteConfig.description,
              "url": siteConfig.url,
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250"
              },
              "author": {
                "@type": "Organization",
                "name": siteConfig.creator,
                "url": siteConfig.url
              }
            })
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": siteConfig.name,
              "url": siteConfig.url,
              "logo": `${siteConfig.url}/logo.png`,
              "sameAs": [
                `https://twitter.com/${siteConfig.twitterHandle.replace('@', '')}`,
                `https://t.me/alfredo_community`,
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Support",
                "email": "official@alfredo.world"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
      <GoogleAnalytics gaId="G-47896JSPV5" />
    </html>
  );
}
