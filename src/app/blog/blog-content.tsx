'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { seoBlogPosts } from '@/data/blog-posts';

const categories = [
  { id: 'all', label: 'All Articles' },
  { id: 'Buying', label: 'Buying' },
  { id: 'Selling', label: 'Selling' },
  { id: 'valuation', label: 'Valuation' },
  { id: 'due-diligence', label: 'Due Diligence' },
  { id: 'financing', label: 'Financing' },
  { id: 'market-trends', label: 'Market Trends' },
];

// Convert SEO blog posts to the display format
const seoPostsForDisplay = seoBlogPosts.map(post => ({
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  category: post.category,
  author: {
    name: post.author.name,
    avatar: `https://i.pravatar.cc/150?u=${post.author.name.replace(/\s/g, '')}`,
    role: post.author.title,
  },
  date: new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  readTime: post.readTime,
  image: post.featuredImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
  isSlugBased: true,
}));

const featuredPost = seoPostsForDisplay[0];

const posts = seoPostsForDisplay.slice(1);

const resources = [
  { title: "Seller's Guide", description: 'Complete guide to selling your business', icon: 'solar:document-text-bold', color: 'emerald' },
  { title: "Buyer's Guide", description: 'How to find and acquire the right business', icon: 'solar:cart-check-bold', color: 'blue' },
  { title: 'Valuation Calculator', description: 'Estimate your business value', icon: 'solar:calculator-bold', color: 'purple' },
  { title: 'NDA Template', description: 'Standard NDA for due diligence', icon: 'solar:shield-check-bold', color: 'amber' },
];

export function BlogContent() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubscribing(false);
    setIsSubscribed(true);
    setEmail('');
  };

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(post => post.category === activeCategory);

  return (
    <div className="min-h-screen bg-dark-50">
      <Header />

      {/* Hero */}
      <section className="bg-dark-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Insights & Resources
            </h1>
            <p className="text-lg text-dark-400">
              Expert advice, market trends, and guides to help you buy or sell a business with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="bg-white border-b border-dark-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors',
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {activeCategory === 'all' && (
          <Link href={`/blog/${featuredPost.slug}`} className="block mb-12 group">
            <Card padding="none" className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="primary" className="backdrop-blur-sm">Featured</Badge>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge variant="default" className="w-fit mb-4 capitalize">{featuredPost.category}</Badge>
                  <h2 className="text-2xl lg:text-3xl font-bold text-dark-900 mb-4 group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-dark-600 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-dark-900">{featuredPost.author.name}</p>
                        <p className="text-xs text-dark-500">{featuredPost.author.role}</p>
                      </div>
                    </div>
                    <div className="text-sm text-dark-500">
                      {featuredPost.date} · {featuredPost.readTime}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <Card padding="none" className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <Badge variant="default" className="mb-3 capitalize">{post.category.replace('-', ' ')}</Badge>
                  <h3 className="text-lg font-bold text-dark-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-dark-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-dark-100">
                    <div className="flex items-center gap-2">
                      <img src={post.author.avatar} alt={post.author.name} className="w-8 h-8 rounded-full" />
                      <span className="text-sm font-medium text-dark-900">{post.author.name}</span>
                    </div>
                    <span className="text-xs text-dark-500">{post.readTime}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Resources Section */}
        <section className="bg-white rounded-2xl border border-dark-200 p-8 lg:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-dark-900 mb-2">Free Resources</h2>
            <p className="text-dark-500">Templates, guides, and tools to help you succeed</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource) => (
              <button
                key={resource.title}
                className="p-6 rounded-xl border border-dark-200 hover:border-primary/50 hover:shadow-md transition-all text-left group"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                  resource.color === 'emerald' && 'bg-emerald-100 text-emerald-600',
                  resource.color === 'blue' && 'bg-blue-100 text-blue-600',
                  resource.color === 'purple' && 'bg-purple-100 text-purple-600',
                  resource.color === 'amber' && 'bg-amber-100 text-amber-600'
                )}>
                  <Icon icon={resource.icon} width={24} />
                </div>
                <h3 className="font-semibold text-dark-900 mb-1 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-sm text-dark-500">{resource.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section className="mt-16 bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Get the latest insights, market trends, and exclusive opportunities delivered to your inbox.
          </p>
          {isSubscribed ? (
            <div className="flex items-center justify-center gap-2 text-white">
              <Icon icon="mdi:check-circle" className="w-6 h-6" />
              <span className="font-medium">Thanks for subscribing! Check your email for confirmation.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-lg text-dark-900 placeholder-dark-400 focus:ring-2 focus:ring-white/50 outline-none"
              />
              <Button type="submit" disabled={isSubscribing} className="bg-white text-primary hover:bg-blue-50 disabled:opacity-70">
                {isSubscribing ? (
                  <>
                    <Icon icon="mdi:loading" className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default BlogContent;
