import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GuideContent } from './guide-content';
import { guides } from '@/data/guides';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find(g => g.slug === slug);

  if (!guide) {
    return {
      title: 'Guide Not Found | BusinessFinder',
    };
  }

  return {
    title: `${guide.title} | BusinessFinder`,
    description: guide.metaDescription,
    keywords: guide.keywords,
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      type: 'article',
      publishedTime: guide.publishedDate,
      modifiedTime: guide.updatedDate,
      authors: [guide.author.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.metaDescription,
    },
  };
}

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = guides.find(g => g.slug === slug);

  if (!guide) {
    notFound();
  }

  return <GuideContent guide={guide} />;
}
