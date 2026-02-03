'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const valuationMethods = [
  {
    title: 'Revenue Multiple',
    description: 'Value based on annual revenue, commonly used for high-growth companies.',
    formula: 'Business Value = Annual Revenue × Multiple',
    typical: '2x - 5x revenue',
    bestFor: 'High-growth SaaS, new businesses with strong revenue growth',
  },
  {
    title: 'SDE Multiple',
    description: 'Seller Discretionary Earnings - most common for small businesses.',
    formula: 'Business Value = SDE × Multiple',
    typical: '2x - 4x SDE',
    bestFor: 'Owner-operated businesses, lifestyle businesses',
  },
  {
    title: 'EBITDA Multiple',
    description: 'Earnings before interest, taxes, depreciation, and amortization.',
    formula: 'Business Value = EBITDA × Multiple',
    typical: '3x - 6x EBITDA',
    bestFor: 'Larger businesses, businesses with employees',
  },
  {
    title: 'ARR/MRR Multiple',
    description: 'Based on recurring revenue, standard for subscription businesses.',
    formula: 'Business Value = ARR × Multiple',
    typical: '3x - 10x ARR',
    bestFor: 'SaaS businesses, subscription models',
  },
];

const industryMultiples = [
  { industry: 'SaaS', revenueMultiple: '3x - 10x', sdeMultiple: '3x - 5x', notes: 'Higher for low churn, high growth' },
  { industry: 'E-commerce', revenueMultiple: '1x - 3x', sdeMultiple: '2x - 4x', notes: 'Depends on brand strength' },
  { industry: 'Content/Media', revenueMultiple: '2x - 4x', sdeMultiple: '2.5x - 4x', notes: 'Traffic quality matters' },
  { industry: 'Marketplace', revenueMultiple: '2x - 5x', sdeMultiple: '3x - 5x', notes: 'Network effects valued' },
  { industry: 'Agency', revenueMultiple: '0.5x - 2x', sdeMultiple: '2x - 3x', notes: 'Client concentration risk' },
  { industry: 'Apps', revenueMultiple: '2x - 6x', sdeMultiple: '3x - 5x', notes: 'User growth important' },
];

export default function ValuationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/resources" className="text-primary hover:underline">Resources</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Valuation Guides</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Business Valuation Guides</h1>
            <p className="text-xl text-gray-300">
              Learn how to properly value online businesses using industry-standard methods and multiples.
            </p>
          </div>
        </div>
      </section>

      {/* Valuation Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-dark mb-8">Common Valuation Methods</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {valuationMethods.map((method, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-xl font-semibold text-dark mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-mono text-dark">{method.formula}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:chart-line" className="w-4 h-4 text-primary" />
                    <span className="text-sm text-gray-600">Typical range: <strong>{method.typical}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="mdi:check" className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Best for: {method.bestFor}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Multiples */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-dark mb-8">Industry Multiples Guide</h2>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Industry</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Revenue Multiple</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark">SDE Multiple</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {industryMultiples.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-dark">{item.industry}</td>
                      <td className="px-6 py-4 text-gray-600">{item.revenueMultiple}</td>
                      <td className="px-6 py-4 text-gray-600">{item.sdeMultiple}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <p className="text-sm text-gray-500 mt-4">
            * Multiples are approximate ranges and can vary significantly based on specific business characteristics,
            market conditions, and deal structure. Always conduct thorough due diligence.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Need a Professional Valuation?</h2>
          <p className="text-gray-600 mb-8">
            Our team of experts can provide a comprehensive valuation of your business
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/sell">
              <Button>Get Free Valuation</Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
