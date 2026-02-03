'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogPost, seoBlogPosts } from '@/data/blog-posts';
import './blog-post.css';

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubscribing(false);
    setIsSubscribed(true);
    setEmail('');
  };

  // Get related posts (same category, exclude current)
  const relatedPosts = seoBlogPosts
    .filter(p => p.slug !== post.slug)
    .filter(p => p.category === post.category || p.keywords.some(k => post.keywords.includes(k)))
    .slice(0, 3);

  // Extract table of contents from content
  const tableOfContents = extractTableOfContents(post.content);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark-900 to-dark-800 text-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">{post.category}</span>
          </nav>

          {/* Category Badge */}
          <Badge variant="primary" className="mb-4 capitalize">
            {post.category}
          </Badge>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-gray-300 mb-8 max-w-3xl">
            {post.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon icon="mdi:account" className="w-6 h-6 text-primary-300" />
              </div>
              <div>
                <p className="text-white font-medium">{post.author.name}</p>
                <p className="text-sm text-gray-400">{post.author.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:calendar" className="w-5 h-5" />
              <span className="text-sm">
                Published {formatDate(post.publishedDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:clock-outline" className="w-5 h-5" />
              <span className="text-sm">{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Area */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            {/* Main Content */}
            <div>
              {/* Table of Contents - Mobile */}
              {tableOfContents.length > 0 && (
                <Card className="p-6 mb-8 lg:hidden">
                  <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                    <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 text-primary" />
                    Table of Contents
                  </h3>
                  <nav>
                    <ul className="space-y-2">
                      {tableOfContents.map((item, index) => (
                        <li key={index}>
                          <a
                            href={`#${item.id}`}
                            className="text-gray-600 hover:text-primary transition-colors text-sm flex items-center gap-2"
                          >
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            {item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </Card>
              )}

              {/* Article Content */}
              <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                  <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-200">
                    <span className="text-sm text-gray-500 mr-2">Keywords:</span>
                    {post.keywords.map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>

                  {/* Share */}
                  <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-600">Share this article:</span>
                    <div className="flex items-center gap-2">
                      <button className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2]/20 transition-colors">
                        <Icon icon="mdi:twitter" className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors">
                        <Icon icon="mdi:linkedin" className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-lg bg-[#4267B2]/10 text-[#4267B2] flex items-center justify-center hover:bg-[#4267B2]/20 transition-colors">
                        <Icon icon="mdi:facebook" className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Icon icon="mdi:link-variant" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Author Bio */}
                <div className="border-t border-gray-100 p-8 md:p-12 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon icon="mdi:account" className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Written by</p>
                      <h4 className="font-semibold text-dark-900 text-lg">{post.author.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">{post.author.title}</p>
                      <p className="text-gray-600 text-sm">{post.author.bio}</p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Newsletter CTA */}
              <section className="mt-12 bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-8 lg:p-12 text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Get More Expert Insights</h2>
                <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                  Subscribe to receive the latest guides, market analysis, and acquisition tips.
                </p>
                {isSubscribed ? (
                  <div className="flex items-center justify-center gap-2 text-white">
                    <Icon icon="mdi:check-circle" className="w-6 h-6" />
                    <span className="font-medium">Thanks for subscribing!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="flex-1 px-4 py-3 rounded-lg text-dark-900 placeholder-gray-400 focus:ring-2 focus:ring-white/50 outline-none"
                    />
                    <Button type="submit" disabled={isSubscribing} className="bg-white text-primary hover:bg-blue-50 disabled:opacity-70">
                      {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </form>
                )}
              </section>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-dark-900 mb-6">Related Articles</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {relatedPosts.map((related) => (
                      <Link key={related.slug} href={`/blog/${related.slug}`}>
                        <Card className="p-6 h-full hover:shadow-lg transition-shadow group">
                          <Badge variant="default" className="mb-3 capitalize">
                            {related.category}
                          </Badge>
                          <h4 className="font-semibold text-dark-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{related.excerpt}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                            {related.readTime}
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to Blog */}
              <div className="text-center mt-12">
                <Link href="/blog">
                  <Button variant="outline">
                    <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
                    Back to All Articles
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                {tableOfContents.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
                      <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 text-primary" />
                      Table of Contents
                    </h3>
                    <nav>
                      <ul className="space-y-3">
                        {tableOfContents.map((item, index) => (
                          <li key={index}>
                            <a
                              href={`#${item.id}`}
                              className="text-gray-600 hover:text-primary transition-colors text-sm flex items-start gap-2 group"
                            >
                              <span className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-primary/10 text-gray-500 group-hover:text-primary text-xs flex items-center justify-center font-medium flex-shrink-0 mt-0.5 transition-colors">
                                {index + 1}
                              </span>
                              <span className="leading-tight">{item.title}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </Card>
                )}

                {/* CTA Card */}
                <Card className="p-6 bg-gradient-to-br from-primary to-blue-600 text-white">
                  <Icon icon="mdi:rocket-launch" className="w-10 h-10 mb-4 opacity-80" />
                  <h3 className="font-semibold text-lg mb-2">Ready to Get Started?</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Browse thousands of verified businesses for sale on BusinessFinder.
                  </p>
                  <Link href="/marketplace">
                    <Button variant="secondary" className="w-full">
                      Explore Listings
                    </Button>
                  </Link>
                </Card>

                {/* Share */}
                <Card className="p-6">
                  <h3 className="font-semibold text-dark-900 mb-4">Share this article</h3>
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center hover:bg-[#1DA1F2]/20 transition-colors">
                      <Icon icon="mdi:twitter" className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center hover:bg-[#0A66C2]/20 transition-colors">
                      <Icon icon="mdi:linkedin" className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366]/20 transition-colors">
                      <Icon icon="mdi:whatsapp" className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Icon icon="mdi:link-variant" className="w-5 h-5" />
                    </button>
                  </div>
                </Card>

                {/* Related Topics */}
                <Card className="p-6">
                  <h3 className="font-semibold text-dark-900 mb-4">Related Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.keywords.slice(0, 6).map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs hover:bg-primary/10 cursor-pointer">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Helper function to extract table of contents from HTML content
function extractTableOfContents(content: string): Array<{ id: string; title: string }> {
  const toc: Array<{ id: string; title: string }> = [];
  const h2Regex = /<h2[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h2>/g;
  let match;

  while ((match = h2Regex.exec(content)) !== null) {
    toc.push({
      id: match[1],
      title: match[2].trim(),
    });
  }

  return toc;
}
