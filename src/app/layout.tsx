import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import '@/styles/globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://businessfinder.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BusinessFinder - Buy and Sell Online Businesses | SaaS, eCommerce, Apps',
    template: '%s | BusinessFinder',
  },
  description:
    'The premier marketplace to buy and sell SaaS, eCommerce, apps, and online businesses. Connect with verified buyers and sellers for seamless business acquisitions.',
  keywords: [
    'buy online business',
    'sell online business',
    'business acquisition',
    'business for sale',
    'SaaS for sale',
    'eCommerce business for sale',
    'app for sale',
    'startup acquisition',
    'business marketplace',
    'acquire business',
    'buy SaaS company',
    'sell SaaS business',
    'eCommerce acquisition',
    'mobile app for sale',
    'content site for sale',
    'subscription business',
    'online business broker',
    'digital business marketplace',
  ],
  authors: [{ name: 'BusinessFinder' }],
  creator: 'BusinessFinder',
  publisher: 'BusinessFinder',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'BusinessFinder',
    title: 'BusinessFinder - Buy and Sell Online Businesses | SaaS, eCommerce, Apps',
    description:
      'The premier marketplace to buy and sell SaaS, eCommerce, apps, and online businesses. Connect with verified buyers and sellers.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BusinessFinder - Buy and Sell Online Businesses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BusinessFinder - Buy and Sell Online Businesses',
    description:
      'The premier marketplace to buy and sell SaaS, eCommerce, apps, and online businesses.',
    images: ['/images/og-image.jpg'],
    creator: '@businessfinder',
    site: '@businessfinder',
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
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: 'business',
};

// Organization structured data
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BusinessFinder',
  description: 'The premier marketplace to buy and sell online businesses.',
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  sameAs: [
    'https://twitter.com/businessfinder',
    'https://linkedin.com/company/businessfinder',
    'https://facebook.com/businessfinder',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@businessfinder.com',
    contactType: 'customer service',
  },
};

// Website structured data with search action
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BusinessFinder',
  description: 'The premier marketplace to buy and sell online businesses.',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/browse?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-dark-50 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
