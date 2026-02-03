'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const faqCategories = [
  {
    name: 'Buying Process',
    icon: 'mdi:cart',
    faqs: [
      {
        question: 'How do I buy a business on BusinessFinder?',
        answer: 'Start by browsing our marketplace and filtering by your criteria. When you find a listing you\'re interested in, sign the NDA to access detailed financials. Then you can reach out to the seller or advisor to express interest, conduct due diligence, make an offer, and close the deal with our support.',
      },
      {
        question: 'How long does the acquisition process take?',
        answer: 'Typically 60-120 days from initial interest to close, depending on the complexity of the business, financing requirements, and due diligence depth. Smaller deals can close in 30-45 days, while larger deals may take 6+ months.',
      },
      {
        question: 'Do I need experience to buy a business?',
        answer: 'While experience helps, it\'s not required. Many first-time buyers successfully acquire businesses. We recommend starting with a business in an industry you understand and ensuring a good transition period with the seller.',
      },
      {
        question: 'What\'s included in the sale of a business?',
        answer: 'This varies by deal but typically includes all assets necessary to operate the business: domain, website, code/content, customer lists, supplier relationships, brand assets, and often a transition/training period with the seller.',
      },
    ],
  },
  {
    name: 'Selling Process',
    icon: 'mdi:store',
    faqs: [
      {
        question: 'How much does it cost to list my business?',
        answer: 'Listing is free. We only charge a success fee when your business sells. Our fee structure is competitive and varies based on deal size - typically 10-15% for smaller deals and lower percentages for larger transactions.',
      },
      {
        question: 'How is my business valued?',
        answer: 'We use industry-standard multiples based on your business type, financial performance, growth trends, and market conditions. Most online businesses are valued at 2-5x annual profit (SDE or EBITDA), though high-growth SaaS can command higher multiples.',
      },
      {
        question: 'How long does it take to sell?',
        answer: 'Average time to sell is 4-6 months, but this varies based on asking price, business quality, and market conditions. Well-priced, profitable businesses with clean financials often sell within 2-3 months.',
      },
      {
        question: 'Is the selling process confidential?',
        answer: 'Absolutely. We only share your business identity with qualified, NDA-signed buyers. Your listing can be anonymous, and we never disclose your business to employees, customers, or competitors without your permission.',
      },
    ],
  },
  {
    name: 'Financing',
    icon: 'mdi:cash',
    faqs: [
      {
        question: 'Can I get financing to buy a business?',
        answer: 'Yes! Common options include SBA loans (up to 90% financing), seller financing, traditional bank loans, and investor partnerships. We can connect you with lenders who specialize in acquisition financing.',
      },
      {
        question: 'What\'s seller financing?',
        answer: 'Seller financing is when the seller agrees to receive a portion of the sale price over time instead of all cash at closing. This is common (60%+ of deals) and benefits both parties - buyers get easier financing, sellers get a premium price.',
      },
      {
        question: 'How much down payment do I need?',
        answer: 'Typically 10-30% of the purchase price, depending on financing structure. SBA loans require 10-20% down, while seller-financed deals might accept 20-50% down with the rest paid over 2-5 years.',
      },
    ],
  },
  {
    name: 'Platform',
    icon: 'mdi:help-circle',
    faqs: [
      {
        question: 'Is BusinessFinder free to use?',
        answer: 'For buyers, yes - browsing, signing NDAs, and connecting with sellers is completely free. For sellers, listing is free and we only charge a success fee upon sale.',
      },
      {
        question: 'How do you verify listings?',
        answer: 'All listings undergo our verification process including financial verification, ownership confirmation, and traffic/revenue validation. We clearly mark verification status on each listing.',
      },
      {
        question: 'What support do you provide?',
        answer: 'We provide dedicated advisors for larger deals, document templates, due diligence checklists, escrow services, and ongoing support throughout the transaction process.',
      },
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('Buying Process');
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const currentCategory = faqCategories.find(c => c.name === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/resources" className="text-primary hover:underline">Resources</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">FAQ</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-300">
              Find answers to common questions about buying, selling, and financing online businesses.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Category Sidebar */}
            <div className="md:w-64 flex-shrink-0">
              <nav className="space-y-2 sticky top-8">
                {faqCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => {
                      setActiveCategory(category.name);
                      setOpenFaq(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeCategory === category.name
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon icon={category.icon} className="w-5 h-5" />
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* FAQ List */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-dark mb-6">{activeCategory}</h2>
              <div className="space-y-4">
                {currentCategory?.faqs.map((faq, index) => (
                  <Card key={index} className="overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === faq.question ? null : faq.question)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <span className="font-medium text-dark pr-8">{faq.question}</span>
                      <Icon
                        icon={openFaq === faq.question ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                        className="w-5 h-5 text-gray-400 flex-shrink-0"
                      />
                    </button>
                    {openFaq === faq.question && (
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-8">
            Our team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/contact">
              <Button>
                <Icon icon="mdi:email" className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="secondary">
                <Icon icon="mdi:headset" className="w-5 h-5 mr-2" />
                Support Center
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
