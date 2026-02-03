'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const caseStudies = [
  {
    title: 'From Employee to SaaS Owner: John\'s $1.2M Acquisition',
    category: 'SaaS Acquisition',
    readTime: '8 min read',
    preview: 'How a former software engineer acquired a profitable SaaS business and grew it 40% in year one.',
    metrics: {
      purchasePrice: '$1.2M',
      monthlyRevenue: '$85K MRR',
      growthYear1: '+40%',
    },
    lessons: [
      'Importance of seller financing in deal structure',
      'How to evaluate technical debt before purchase',
      'Building relationships with existing customers',
    ],
  },
  {
    title: 'Building a Content Empire: Sarah\'s Portfolio Strategy',
    category: 'Content Sites',
    readTime: '10 min read',
    preview: 'A marketing professional built a 7-figure portfolio of content sites through strategic acquisitions.',
    metrics: {
      totalInvested: '$850K',
      portfolioValue: '$2.8M',
      sites: '12 sites',
    },
    lessons: [
      'Why smaller acquisitions can be less risky',
      'Content site due diligence essentials',
      'Leveraging one site to fund the next',
    ],
  },
  {
    title: 'E-commerce Exit: Growing Revenue 3x Before Selling',
    category: 'E-commerce',
    readTime: '12 min read',
    preview: 'How a couple bought a struggling e-commerce store, turned it around, and sold for 3x their purchase price.',
    metrics: {
      purchasePrice: '$180K',
      salePrice: '$540K',
      holdingPeriod: '2.5 years',
    },
    lessons: [
      'Identifying undervalued e-commerce opportunities',
      'Quick wins for improving profitability',
      'Timing your exit for maximum value',
    ],
  },
  {
    title: 'First-Time Buyer Success: A Newsletter Acquisition Journey',
    category: 'Newsletter',
    readTime: '6 min read',
    preview: 'A complete newbie to online businesses successfully acquired and operates a profitable newsletter.',
    metrics: {
      purchasePrice: '$75K',
      subscribers: '45K',
      monthlyProfit: '$8K',
    },
    lessons: [
      'How to evaluate newsletter businesses',
      'The importance of the seller transition period',
      'Growing subscriber base post-acquisition',
    ],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/resources" className="text-primary hover:underline">Resources</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Case Studies</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Acquisition Case Studies</h1>
            <p className="text-xl text-gray-300">
              Real stories from buyers who successfully acquired and grew online businesses.
              Learn from their experiences, challenges, and wins.
            </p>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                    <div className="text-center">
                      <Icon icon="mdi:account-circle" className="w-20 h-20 text-primary/50 mx-auto mb-4" />
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {study.category}
                      </span>
                    </div>
                  </div>
                  <div className="md:w-2/3 p-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Icon icon="mdi:clock-outline" className="w-4 h-4" />
                      {study.readTime}
                    </div>
                    <h2 className="text-2xl font-bold text-dark mb-3">{study.title}</h2>
                    <p className="text-gray-600 mb-6">{study.preview}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {Object.entries(study.metrics).map(([key, value], idx) => (
                        <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xl font-bold text-primary">{value}</p>
                          <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Key Lessons */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-dark mb-2">Key Lessons:</h4>
                      <ul className="space-y-1">
                        {study.lessons.map((lesson, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <Icon icon="mdi:lightbulb" className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                            {lesson}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button>
                      Read Full Case Study
                      <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-gray-600 mb-8">
            Browse our marketplace to find the perfect business opportunity for you.
          </p>
          <Link href="/marketplace">
            <Button size="lg">
              Browse Businesses for Sale
              <Icon icon="mdi:arrow-right" className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
