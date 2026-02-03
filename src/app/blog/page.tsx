import { Metadata } from 'next';
import { BlogContent } from './blog-content';

export const metadata: Metadata = {
  title: 'Blog - Business Buying & Selling Insights | BusinessFinder',
  description: 'Expert guides on how to find a business for sale, buy a business, and succeed as a business owner. Get actionable advice on valuations, due diligence, financing, and more.',
  keywords: [
    'business for sale',
    'buy a business',
    'business finder',
    'business acquisition blog',
    'how to buy a business',
    'businesses for sale',
    'small business for sale',
    'online business for sale',
    'SaaS for sale',
    'ecommerce business for sale',
    'business valuation',
    'due diligence checklist',
    'business acquisition financing',
  ],
  alternates: {
    canonical: 'https://businessfinder.com/blog',
  },
  openGraph: {
    title: 'Blog - Business Buying & Selling Insights | BusinessFinder',
    description: 'Expert guides on how to find a business for sale, buy a business, and succeed as a business owner.',
    type: 'website',
    url: 'https://businessfinder.com/blog',
    siteName: 'BusinessFinder',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Business Buying & Selling Insights | BusinessFinder',
    description: 'Expert guides on how to find a business for sale, buy a business, and succeed as a business owner.',
  },
};

// JSON-LD structured data for blog listing
const blogListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'BusinessFinder Blog',
  description: 'Expert guides on business acquisitions, valuations, due diligence, and financing.',
  url: 'https://businessfinder.com/blog',
  publisher: {
    '@type': 'Organization',
    name: 'BusinessFinder',
    logo: {
      '@type': 'ImageObject',
      url: 'https://businessfinder.com/logo.png',
    },
  },
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListJsonLd) }}
      />
      <BlogContent />
    </>
  );
}
