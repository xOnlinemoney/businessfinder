'use client';

// SEO Head Component
// Adds meta tags and structured data to pages

import Script from 'next/script';
import { siteConfig } from '@/lib/seo/config';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noindex?: boolean;
  canonicalUrl?: string;
  structuredData?: object | object[];
}

export function SEOHead({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  noindex = false,
  canonicalUrl,
  structuredData,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const fullDescription = description || siteConfig.description;
  const fullOgImage = ogImage || siteConfig.ogImage;
  const fullCanonicalUrl = canonicalUrl || siteConfig.url;

  // Render structured data as JSON-LD
  const renderStructuredData = () => {
    if (!structuredData) return null;

    const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];

    return dataArray.map((data, index) => (
      <Script
        key={`structured-data-${index}`}
        id={`structured-data-${index}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    ));
  };

  return (
    <>
      {/* Basic Meta Tags - These are handled by Next.js metadata API in layout/page */}
      {/* This component is for dynamic structured data */}

      {/* Structured Data */}
      {renderStructuredData()}

      {/* Additional Scripts */}
      {noindex && (
        <meta name="robots" content="noindex, nofollow" />
      )}
    </>
  );
}

// Helper component for social sharing preview
export function SocialPreview({
  title,
  description,
  image
}: {
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden max-w-md">
      <div className="aspect-[1.91/1] bg-gray-100 relative">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="p-3 bg-gray-50">
        <p className="text-xs text-gray-500 uppercase">{siteConfig.url.replace('https://', '')}</p>
        <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
