// SEO Configuration
// Centralized SEO settings for the BusinessFinder platform

export const siteConfig = {
  name: 'BusinessFinder',
  tagline: 'Buy and Sell Online Businesses',
  description: 'The premier marketplace to buy and sell SaaS, eCommerce, apps, and online businesses. Connect with verified buyers and sellers for seamless business acquisitions.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://businessfinder.com',
  ogImage: '/images/og-image.jpg',
  twitterHandle: '@businessfinder',
  email: 'hello@businessfinder.com',
};

// Primary keywords for SEO optimization
export const primaryKeywords = [
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
];

// Secondary keywords
export const secondaryKeywords = [
  'buy SaaS company',
  'sell SaaS business',
  'eCommerce acquisition',
  'mobile app for sale',
  'content site for sale',
  'subscription business',
  'online business broker',
  'digital business marketplace',
  'startup for sale',
  'business valuation',
];

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'BusinessFinder - Buy and Sell Online Businesses | SaaS, eCommerce, Apps',
    description: 'Discover the best marketplace to buy and sell online businesses. Find verified SaaS, eCommerce stores, mobile apps, and digital businesses for acquisition.',
    keywords: [...primaryKeywords, 'business buying platform', 'business selling platform'],
  },
  browse: {
    title: 'Browse Businesses for Sale | SaaS, eCommerce, Apps | BusinessFinder',
    description: 'Explore hundreds of online businesses for sale. Filter by industry, revenue, price, and more. Find your next SaaS, eCommerce, or app acquisition.',
    keywords: ['businesses for sale', 'SaaS companies for sale', 'eCommerce stores for sale', 'apps for sale'],
  },
  sell: {
    title: 'Sell Your Online Business | List Your SaaS, eCommerce, or App | BusinessFinder',
    description: 'List your online business for sale and connect with qualified buyers. Sell your SaaS, eCommerce store, mobile app, or digital business quickly and securely.',
    keywords: ['sell my business', 'list business for sale', 'sell SaaS', 'sell eCommerce store', 'sell app'],
  },
  buy: {
    title: 'Buy an Online Business | Acquire SaaS, eCommerce, Apps | BusinessFinder',
    description: 'Find and acquire profitable online businesses. Browse verified listings of SaaS companies, eCommerce stores, apps, and more. Start your acquisition journey.',
    keywords: ['buy online business', 'acquire SaaS', 'buy eCommerce store', 'acquire app', 'business acquisition'],
  },
  resources: {
    title: 'Resources & Guides for Business Buyers and Sellers | BusinessFinder',
    description: 'Expert guides, due diligence checklists, valuation tools, and resources for buying and selling online businesses. Learn from successful acquisitions.',
    keywords: ['business acquisition guide', 'due diligence checklist', 'business valuation', 'sell business guide'],
  },
  blog: {
    title: 'Blog - Business Buying & Selling Insights | BusinessFinder',
    description: 'Read the latest articles on online business acquisitions, market trends, success stories, and expert tips for buyers and sellers.',
    keywords: ['business acquisition blog', 'SaaS market trends', 'eCommerce insights', 'startup news'],
  },
  pricing: {
    title: 'Pricing Plans for Sellers | BusinessFinder',
    description: 'Simple, transparent pricing for listing your business. Choose the plan that fits your needs and start connecting with qualified buyers.',
    keywords: ['sell business pricing', 'listing fees', 'business broker fees'],
  },
  login: {
    title: 'Login | BusinessFinder',
    description: 'Sign in to your BusinessFinder account to manage your listings, messages, and offers.',
    keywords: [],
  },
  register: {
    title: 'Create Account | BusinessFinder',
    description: 'Join BusinessFinder to buy or sell online businesses. Create your free account and start your journey.',
    keywords: [],
  },
  dashboard: {
    title: 'Dashboard | BusinessFinder',
    description: 'Manage your listings, messages, offers, and account settings.',
    keywords: [],
    noindex: true,
  },
};

// Category-specific SEO
export const categorySEO: Record<string, { title: string; description: string; keywords: string[] }> = {
  saas: {
    title: 'SaaS Businesses for Sale | Software Companies | BusinessFinder',
    description: 'Browse SaaS businesses for sale. Find profitable software-as-a-service companies with recurring revenue, verified metrics, and growth potential.',
    keywords: ['SaaS for sale', 'software business for sale', 'SaaS acquisition', 'buy SaaS company', 'MRR business'],
  },
  ecommerce: {
    title: 'eCommerce Businesses for Sale | Online Stores | BusinessFinder',
    description: 'Discover eCommerce businesses for sale. Find established online stores with verified revenue, inventory, and customer bases ready for acquisition.',
    keywords: ['eCommerce for sale', 'online store for sale', 'buy eCommerce business', 'Shopify store for sale', 'Amazon FBA business'],
  },
  apps: {
    title: 'Mobile Apps for Sale | iOS & Android Apps | BusinessFinder',
    description: 'Find mobile apps for sale on iOS and Android. Acquire profitable apps with active users, revenue, and growth opportunities.',
    keywords: ['app for sale', 'mobile app acquisition', 'buy iOS app', 'buy Android app', 'app business for sale'],
  },
  content: {
    title: 'Content Businesses for Sale | Blogs & Media Sites | BusinessFinder',
    description: 'Browse content businesses for sale including blogs, newsletters, and media sites. Find established audiences and monetized content properties.',
    keywords: ['blog for sale', 'content site for sale', 'newsletter for sale', 'media business acquisition'],
  },
  marketplace: {
    title: 'Marketplace Businesses for Sale | Platform Acquisitions | BusinessFinder',
    description: 'Discover marketplace platforms for sale. Two-sided marketplaces with established networks and transaction volume.',
    keywords: ['marketplace for sale', 'platform business for sale', 'buy marketplace business'],
  },
  agency: {
    title: 'Digital Agencies for Sale | Service Businesses | BusinessFinder',
    description: 'Find digital agencies and service businesses for sale. Acquire established client bases, team, and recurring revenue.',
    keywords: ['agency for sale', 'digital agency acquisition', 'marketing agency for sale', 'service business for sale'],
  },
};

// Structured Data Templates
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    sameAs: [
      'https://twitter.com/businessfinder',
      'https://linkedin.com/company/businessfinder',
      'https://facebook.com/businessfinder',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.email,
      contactType: 'customer service',
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/browse?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateListingSchema(listing: {
  id: string;
  title: string;
  description: string;
  asking_price: number;
  business_type: string;
  seller?: { full_name: string };
  created_at: string;
  logo_url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: listing.description,
    url: `${siteConfig.url}/listings/${listing.id}`,
    image: listing.logo_url || `${siteConfig.url}/images/placeholder-listing.jpg`,
    category: listing.business_type,
    offers: {
      '@type': 'Offer',
      price: listing.asking_price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Person',
        name: listing.seller?.full_name || 'Business Owner',
      },
    },
    datePosted: listing.created_at,
  };
}

export function generateBlogPostSchema(post: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author?: { full_name: string };
  published_at: string;
  featured_image_url?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    url: `${siteConfig.url}/blog/${post.slug}`,
    image: post.featured_image_url || `${siteConfig.url}/images/blog-placeholder.jpg`,
    datePublished: post.published_at,
    author: {
      '@type': 'Person',
      name: post.author?.full_name || 'BusinessFinder Team',
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/logo.png`,
      },
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
