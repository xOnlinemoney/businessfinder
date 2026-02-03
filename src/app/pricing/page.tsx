import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Pricing Plans for Sellers',
  description: 'Simple, transparent pricing for listing your business. Success-based fees only - you don\'t pay unless your business sells. Free for buyers.',
  keywords: [
    'sell business pricing',
    'business broker fees',
    'listing fees',
    'business marketplace pricing',
    'success fee',
  ],
  alternates: {
    canonical: '/pricing',
  },
};

const buyerFeatures = [
  'Access to all listings',
  'NDA signing & document access',
  'Direct messaging with sellers',
  'Dedicated buyer advisor',
  'Due diligence support',
  'Deal structuring guidance',
];

const sellerFeatures = [
  'Free business valuation',
  'Professional listing creation',
  'Financial verification',
  'Marketing to 50K+ buyers',
  'Dedicated selling advisor',
  'Offer negotiation support',
  'Closing coordination',
  'Escrow services',
];

const faqs = [
  { q: 'When do I pay?', a: 'You only pay when your business successfully sells and the deal closes. No upfront fees, no monthly subscriptions.' },
  { q: 'What is the success fee?', a: 'Our success fee is a small percentage of the final sale price, significantly lower than traditional brokers (typically 10-15%). Contact us for exact rates based on your deal size.' },
  { q: 'Are there any hidden fees?', a: 'No. Our success fee covers everything: listing, marketing, advisor support, negotiation assistance, and closing coordination.' },
  { q: 'What if my business doesn\'t sell?', a: 'You pay nothing. Our success-based model means we only succeed when you do.' },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-dark-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            Success-based fees only. You don't pay unless your business sells.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 -mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Buyers */}
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:cart-large-2-bold" width={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-dark-900 mb-2">For Buyers</h2>
              <div className="mb-6">
                <span className="text-5xl font-bold text-primary">Free</span>
              </div>
              <p className="text-dark-600 mb-8">Browse, connect, and acquire businesses with no fees to buyers.</p>
              <ul className="space-y-3 mb-8 text-left">
                {buyerFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-dark-600">
                    <Icon icon="solar:check-circle-bold" width={18} className="text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button variant="primary" className="w-full">Start Browsing</Button>
              </Link>
            </Card>

            {/* Sellers */}
            <Card className="text-center p-8 border-2 border-emerald-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:tag-price-bold" width={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-dark-900 mb-2">For Sellers</h2>
              <div className="mb-6">
                <span className="text-5xl font-bold text-emerald-600">Success</span>
                <span className="text-dark-500 ml-2">based</span>
              </div>
              <p className="text-dark-600 mb-8">Only pay when your business sells. No upfront costs.</p>
              <ul className="space-y-3 mb-8 text-left">
                {sellerFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-dark-600">
                    <Icon icon="solar:check-circle-bold" width={18} className="text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/sell">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">Get Free Valuation</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-900 mb-4">How We Compare</h2>
          </div>
          <Card padding="none">
            <table className="w-full">
              <thead className="bg-dark-100">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-dark-900">Feature</th>
                  <th className="p-4 text-center text-sm font-semibold text-dark-500">Traditional Broker</th>
                  <th className="p-4 text-center text-sm font-semibold text-primary">BusinessFinder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                <tr>
                  <td className="p-4 text-dark-600">Commission</td>
                  <td className="p-4 text-center text-dark-500">10-15%</td>
                  <td className="p-4 text-center font-semibold text-emerald-600">Lower ✓</td>
                </tr>
                <tr>
                  <td className="p-4 text-dark-600">Upfront Fees</td>
                  <td className="p-4 text-center text-dark-500">$5K-$15K</td>
                  <td className="p-4 text-center font-semibold text-emerald-600">$0 ✓</td>
                </tr>
                <tr>
                  <td className="p-4 text-dark-600">Time to List</td>
                  <td className="p-4 text-center text-dark-500">2-4 weeks</td>
                  <td className="p-4 text-center font-semibold text-emerald-600">24-48 hours ✓</td>
                </tr>
                <tr>
                  <td className="p-4 text-dark-600">Buyer Network</td>
                  <td className="p-4 text-center text-dark-500">Limited</td>
                  <td className="p-4 text-center font-semibold text-emerald-600">50,000+ ✓</td>
                </tr>
                <tr>
                  <td className="p-4 text-dark-600">Technology Platform</td>
                  <td className="p-4 text-center text-dark-500">Basic</td>
                  <td className="p-4 text-center font-semibold text-emerald-600">Full Suite ✓</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.q}>
                <h3 className="font-bold text-dark-900 mb-2">{faq.q}</h3>
                <p className="text-dark-600">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-dark-400 mb-8">List your business for free and only pay when you succeed.</p>
          <Link href="/sell">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" size="lg">Get Your Free Valuation</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
