'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';

const ddCategories = [
  {
    title: 'Financial Due Diligence',
    icon: 'mdi:chart-line',
    items: [
      'Review 3 years of financial statements',
      'Verify revenue sources and consistency',
      'Analyze profit margins and trends',
      'Check for any outstanding debts or liabilities',
      'Review tax returns and compliance',
      'Understand customer payment terms',
      'Verify bank statements match reported revenue',
      'Analyze cash flow patterns',
    ],
  },
  {
    title: 'Operational Due Diligence',
    icon: 'mdi:cog',
    items: [
      'Document all business processes',
      'Review vendor and supplier relationships',
      'Assess technology stack and infrastructure',
      'Evaluate team structure and key employees',
      'Review customer support processes',
      'Understand inventory management (if applicable)',
      'Check for operational dependencies',
      'Review automation and systems',
    ],
  },
  {
    title: 'Legal Due Diligence',
    icon: 'mdi:scale-balance',
    items: [
      'Review all contracts and agreements',
      'Check intellectual property ownership',
      'Verify business licenses and permits',
      'Review employee/contractor agreements',
      'Check for any pending litigation',
      'Review privacy policy and compliance',
      'Verify trademark and domain ownership',
      'Assess regulatory compliance',
    ],
  },
  {
    title: 'Technical Due Diligence',
    icon: 'mdi:code-tags',
    items: [
      'Review codebase quality and documentation',
      'Assess technical debt',
      'Verify hosting and infrastructure setup',
      'Review security practices and history',
      'Check API integrations and dependencies',
      'Evaluate scalability potential',
      'Review backup and disaster recovery',
      'Assess development processes',
    ],
  },
  {
    title: 'Customer Due Diligence',
    icon: 'mdi:account-group',
    items: [
      'Analyze customer concentration',
      'Review churn rates and trends',
      'Understand customer acquisition channels',
      'Calculate customer lifetime value (LTV)',
      'Review customer feedback and NPS',
      'Assess customer support satisfaction',
      'Understand competitive positioning',
      'Review customer contracts and terms',
    ],
  },
  {
    title: 'Market Due Diligence',
    icon: 'mdi:trending-up',
    items: [
      'Analyze market size and growth',
      'Identify competitors and positioning',
      'Review industry trends',
      'Assess barriers to entry',
      'Evaluate regulatory environment',
      'Understand market risks',
      'Review pricing competitiveness',
      'Assess future market opportunities',
    ],
  },
];

export default function DueDiligencePage() {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/resources" className="text-primary hover:underline">Resources</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Due Diligence</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Due Diligence Checklist</h1>
            <p className="text-xl text-gray-300 mb-6">
              A comprehensive guide to thoroughly evaluate a business before acquisition.
              Don&apos;t skip these critical steps.
            </p>
            <Button onClick={() => { setShowDownloadModal(true); setIsSubmitted(false); setEmail(''); }}>
              <Icon icon="mdi:download" className="w-5 h-5 mr-2" />
              Download Full Checklist (PDF)
            </Button>
          </div>
        </div>
      </section>

      {/* Checklist Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {ddCategories.map((category, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon icon={category.icon} className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-dark">{category.title}</h2>
                </div>

                <ul className="space-y-3">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded border border-gray-300 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-dark mb-8 text-center">Due Diligence Best Practices</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-l-primary">
              <h3 className="font-semibold text-dark mb-2">Request Raw Data</h3>
              <p className="text-gray-600 text-sm">
                Always request direct access to analytics, bank accounts, and accounting software rather than just screenshots or reports.
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-l-primary">
              <h3 className="font-semibold text-dark mb-2">Talk to Customers</h3>
              <p className="text-gray-600 text-sm">
                If possible, speak with a few customers to understand their experience and satisfaction with the business.
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-l-primary">
              <h3 className="font-semibold text-dark mb-2">Use Professionals</h3>
              <p className="text-gray-600 text-sm">
                For significant acquisitions, hire an accountant, lawyer, and technical expert to review their respective areas.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Need Help With Due Diligence?</h2>
          <p className="text-gray-600 mb-8">
            Our advisors can guide you through the due diligence process and help identify potential issues.
          </p>
          <Link href="/contact">
            <Button>Contact an Advisor</Button>
          </Link>
        </div>
      </section>

      <Footer />

      {/* Download Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Download Due Diligence Checklist"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="mdi:check-circle" className="text-emerald-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-dark mb-2">Check Your Email!</h3>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent the Due Diligence Checklist PDF to your email address.
            </p>
            <Button onClick={() => setShowDownloadModal(false)}>Done</Button>
          </div>
        ) : (
          <form onSubmit={handleDownload} className="space-y-4">
            <p className="text-gray-600">
              Enter your email to receive the complete due diligence checklist as a downloadable PDF.
            </p>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowDownloadModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Icon icon="mdi:loading" className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:download" className="w-5 h-5 mr-2" />
                    Get PDF
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
