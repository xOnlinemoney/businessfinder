import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { seoBlogPosts } from '@/data/blog-posts';
import { BlogPostContent } from './blog-post-content';

// Generate static params for all blog posts
export async function generateStaticParams() {
  return seoBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const post = seoBlogPosts.find(p => p.slug === slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  const canonicalUrl = `https://businessfinder.com/blog/${post.slug}`;

  return {
    title: `${post.title} | BusinessFinder Blog`,
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.publishedDate,
      modifiedTime: post.updatedDate,
      authors: [post.author.name],
      tags: post.keywords,
      url: canonicalUrl,
      siteName: 'BusinessFinder',
      images: post.featuredImage ? [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: canonicalUrl,
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
  };
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const post = seoBlogPosts.find(p => p.slug === slug);

  if (!post) {
    notFound();
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    image: post.featuredImage || 'https://businessfinder.com/og-image.jpg',
    datePublished: post.publishedDate,
    dateModified: post.updatedDate,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.title,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BusinessFinder',
      logo: {
        '@type': 'ImageObject',
        url: 'https://businessfinder.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://businessfinder.com/blog/${post.slug}`,
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    wordCount: post.content.split(/\s+/).length,
  };

  // FAQ structured data if applicable (extract from content)
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: extractFAQs(post.content),
  };

  // Breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://businessfinder.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://businessfinder.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://businessfinder.com/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd.mainEntity.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <BlogPostContent post={post} />
    </>
  );
}

// Helper function to extract FAQ-like content from the post
function extractFAQs(content: string): Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> {
  const faqs: Array<{ '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }> = [];

  // Extract H2/H3 headings and their following content as potential FAQs
  const h2Regex = /<h2[^>]*>([^<]+)<\/h2>\s*<p>([^<]+)<\/p>/g;
  let match;

  while ((match = h2Regex.exec(content)) !== null && faqs.length < 5) {
    const question = match[1].trim();
    const answer = match[2].trim();

    if (question.includes('?') || question.toLowerCase().includes('how') || question.toLowerCase().includes('what') || question.toLowerCase().includes('why')) {
      faqs.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      });
    }
  }

  return faqs;
}
