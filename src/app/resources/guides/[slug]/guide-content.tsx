'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Guide, guides } from '@/data/guides';
import './guide.css';

interface GuideContentProps {
  guide: Guide;
}

export function GuideContent({ guide }: GuideContentProps) {
  const relatedGuides = guides.filter(g => g.slug !== guide.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/resources" className="hover:text-white transition-colors">Resources</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">{guide.category}</span>
          </nav>

          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-primary/20 text-primary-300 text-sm font-medium rounded-full mb-4">
            {guide.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {guide.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Icon icon="mdi:account" className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{guide.author.name}</p>
                <p className="text-xs text-gray-400">{guide.author.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:calendar" className="w-5 h-5" />
              <span className="text-sm">
                Updated {new Date(guide.updatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon icon="mdi:clock-outline" className="w-5 h-5" />
              <span className="text-sm">{guide.readTime}</span>
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
              <Card className="p-6 mb-8 lg:hidden">
                <h3 className="font-semibold text-dark mb-4 flex items-center gap-2">
                  <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 text-primary" />
                  Table of Contents
                </h3>
                <nav>
                  <ul className="space-y-2">
                    {guide.tableOfContents.map((item, index) => (
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

              {/* Article Content */}
              <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                  <div
                    className="guide-content"
                    dangerouslySetInnerHTML={{ __html: guide.content }}
                  />
                </div>

                {/* Author Bio */}
                <div className="border-t border-gray-100 p-8 md:p-12 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon icon="mdi:account" className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Written by</p>
                      <h4 className="font-semibold text-dark text-lg">{guide.author.name}</h4>
                      <p className="text-gray-600 text-sm mb-3">{guide.author.title}</p>
                      <p className="text-gray-600 text-sm">{guide.author.bio}</p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Related Guides */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-dark mb-6">Related Guides</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedGuides.map((related, index) => (
                    <Link key={index} href={`/resources/guides/${related.slug}`}>
                      <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {related.category}
                        </span>
                        <h4 className="font-semibold text-dark mt-3 mb-2">{related.title}</h4>
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
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Table of Contents */}
                <Card className="p-6">
                  <h3 className="font-semibold text-dark mb-4 flex items-center gap-2">
                    <Icon icon="mdi:format-list-bulleted" className="w-5 h-5 text-primary" />
                    Table of Contents
                  </h3>
                  <nav>
                    <ul className="space-y-3">
                      {guide.tableOfContents.map((item, index) => (
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

                {/* CTA Card */}
                <Card className="p-6 bg-gradient-to-br from-primary to-primary-600 text-white">
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
                  <h3 className="font-semibold text-dark mb-4">Share this guide</h3>
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
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Get More Expert Insights
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Subscribe to receive the latest guides, market analysis, and acquisition tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
