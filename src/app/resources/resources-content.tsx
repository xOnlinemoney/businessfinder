'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featured_image: string | null;
  published_at: string;
  author?: {
    first_name: string;
    last_name: string;
  };
}

const resourceCategories = [
  {
    title: 'Valuation Guides',
    description: 'Learn how to properly value online businesses',
    icon: 'mdi:calculator',
    href: '/resources/valuation',
    resources: [
      'SaaS Valuation Methods',
      'E-commerce Multiples Guide',
      'Content Site Valuation',
      'Revenue vs Profit Multiples',
    ],
  },
  {
    title: 'Due Diligence',
    description: 'Comprehensive checklists and guides for buyers',
    icon: 'mdi:clipboard-check',
    href: '/resources/due-diligence',
    resources: [
      'Financial Due Diligence',
      'Technical Assessment',
      'Legal Checklist',
      'Operations Review',
    ],
  },
  {
    title: 'Case Studies',
    description: 'Real acquisition stories and lessons learned',
    icon: 'mdi:book-open-variant',
    href: '/resources/case-studies',
    resources: [
      'SaaS Acquisition Stories',
      'First-Time Buyer Experiences',
      'Portfolio Building Strategies',
      'Exit Success Stories',
    ],
  },
  {
    title: 'FAQ',
    description: 'Answers to common questions about buying and selling',
    icon: 'mdi:help-circle',
    href: '/resources/faq',
    resources: [
      'Buying Process FAQ',
      'Selling Process FAQ',
      'Financing Questions',
      'Platform Questions',
    ],
  },
];

const featuredGuides = [
  {
    title: 'The Complete Guide to Buying an Online Business',
    description: 'Everything you need to know about acquiring your first online business, from finding opportunities to closing the deal.',
    readTime: '25 min read',
    category: 'Buying',
    slug: 'complete-guide-to-buying-an-online-business',
  },
  {
    title: 'How to Prepare Your Business for Sale',
    description: 'Maximize your exit value with our comprehensive preparation guide for sellers.',
    readTime: '20 min read',
    category: 'Selling',
    slug: 'how-to-prepare-your-business-for-sale',
  },
  {
    title: 'Understanding SBA Loans for Acquisitions',
    description: 'A deep dive into SBA 7(a) loans and how to qualify for acquisition financing.',
    readTime: '15 min read',
    category: 'Financing',
    slug: 'understanding-sba-loans-for-acquisitions',
  },
];


export function ResourcesContent() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setIsLoadingBlogs(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            category,
            featured_image,
            published_at,
            author:profiles(first_name, last_name)
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setBlogPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setIsLoadingBlogs(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Resources & Guides
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Everything you need to successfully buy or sell an online business.
              Expert guides, templates, and tools to help you navigate the process.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">
                <Icon icon="mdi:book-open" className="w-5 h-5 mr-2" />
                Browse Guides
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-4">Resource Categories</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Explore our comprehensive library of resources organized by topic
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {resourceCategories.map((category, index) => (
              <Link key={index} href={category.href}>
                <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon icon={category.icon} className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-dark mb-2">{category.title}</h3>
                      <p className="text-gray-600 mb-4">{category.description}</p>
                      <ul className="space-y-2">
                        {category.resources.map((resource, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <Icon icon="mdi:chevron-right" className="w-4 h-4 text-primary" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-4">Featured Guides</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our most popular and comprehensive guides
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredGuides.map((guide, index) => (
              <Link key={index} href={`/resources/guides/${guide.slug}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Icon icon="mdi:book-open-page-variant" className="w-16 h-16 text-primary/50" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {guide.category}
                    </span>
                    <h3 className="text-lg font-semibold text-dark mt-3 mb-2">{guide.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{guide.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{guide.readTime}</span>
                      <Button variant="ghost" size="sm">
                        Read More
                        <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-dark mb-2">Latest Blog Posts</h2>
              <p className="text-gray-600">
                Insights, tips, and news from our team of experts
              </p>
            </div>
            <Link href="/blog">
              <Button variant="secondary">
                View All Posts
                <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {isLoadingBlogs ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </Card>
              ))}
            </div>
          ) : blogPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon icon="mdi:newspaper-variant-outline" className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {post.category || 'General'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(post.published_at)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-dark mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {post.excerpt || 'Read more about this topic...'}
                      </p>
                      {post.author && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Icon icon="mdi:account-circle" className="w-4 h-4" />
                          <span>
                            {post.author.first_name} {post.author.last_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Icon icon="mdi:newspaper-variant-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-dark mb-2">No Blog Posts Yet</h3>
              <p className="text-gray-600 mb-6">
                Check back soon for the latest insights and tips from our team.
              </p>
              <Link href="/marketplace">
                <Button>
                  Browse Listings Instead
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Get the latest guides, market insights, and acquisition tips delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg"
            />
            <Button variant="secondary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
