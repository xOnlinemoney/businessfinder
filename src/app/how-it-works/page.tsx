import { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'How It Works | BusinessFinder',
  description: 'Learn how to buy or sell a business on BusinessFinder. Our simple process makes acquisitions easy.',
};

const buyerSteps = [
  { icon: 'solar:magnifer-bold', title: 'Browse Listings', description: 'Explore our curated marketplace of verified businesses across various industries.' },
  { icon: 'solar:shield-check-bold', title: 'Sign NDA', description: 'Sign a confidentiality agreement to access detailed financials and sensitive information.' },
  { icon: 'solar:chat-round-dots-bold', title: 'Connect & Ask Questions', description: 'Message sellers directly or work with our advisors to learn more about opportunities.' },
  { icon: 'solar:document-text-bold', title: 'Submit an Offer', description: 'When ready, submit your offer through our secure platform with deal terms.' },
  { icon: 'solar:checklist-bold', title: 'Due Diligence', description: 'Verify all claims, review documents, and conduct thorough due diligence.' },
  { icon: 'solar:hand-shake-bold', title: 'Close the Deal', description: 'Our team guides you through closing, ensuring a smooth ownership transfer.' },
];

const sellerSteps = [
  { icon: 'solar:calculator-bold', title: 'Free Valuation', description: 'Get an AI-powered valuation based on your financials and market data.' },
  { icon: 'solar:document-add-bold', title: 'Create Your Listing', description: 'Complete our guided onboarding to create a compelling listing.' },
  { icon: 'solar:eye-bold', title: 'Go Live', description: 'After verification, your listing goes live to our network of 50,000+ buyers.' },
  { icon: 'solar:users-group-rounded-bold', title: 'Receive Inquiries', description: 'Qualified buyers will reach out. Our team helps screen and qualify them.' },
  { icon: 'solar:dollar-bold', title: 'Review Offers', description: 'Receive and compare offers with guidance from your dedicated advisor.' },
  { icon: 'solar:cup-star-bold', title: 'Celebrate Your Exit', description: 'Close the deal and receive your funds through secure escrow.' },
];

const features = [
  { icon: 'solar:verified-check-bold', title: 'Verified Listings', description: 'Every listing undergoes financial verification by our team.' },
  { icon: 'solar:lock-bold', title: 'Secure & Confidential', description: 'NDA protection and secure messaging keep your information safe.' },
  { icon: 'solar:headphones-round-bold', title: 'Expert Advisors', description: 'Dedicated M&A specialists guide you through every step.' },
  { icon: 'solar:shield-check-bold', title: 'Escrow Protection', description: 'Funds are held securely until all conditions are met.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-dark-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">How It Works</h1>
          <p className="text-lg text-dark-400 max-w-2xl mx-auto">
            Whether you're buying or selling, our streamlined process makes business acquisitions simple and secure.
          </p>
        </div>
      </section>

      {/* Buyer Journey */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm uppercase tracking-wide">For Buyers</span>
            <h2 className="text-3xl font-bold text-dark-900 mt-2">Find Your Perfect Acquisition</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {buyerSteps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="bg-white border border-dark-200 rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg transition-all h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon icon={step.icon} width={24} className="text-primary" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-dark-900 mb-2">{step.title}</h3>
                  <p className="text-dark-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/marketplace">
              <Button variant="primary" size="lg">Browse Listings</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Seller Journey */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-bold text-sm uppercase tracking-wide">For Sellers</span>
            <h2 className="text-3xl font-bold text-dark-900 mt-2">Sell for Maximum Value</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sellerSteps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="bg-white border border-dark-200 rounded-2xl p-6 hover:border-emerald-500/50 hover:shadow-lg transition-all h-full">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon icon={step.icon} width={24} className="text-emerald-600" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-dark-900 mb-2">{step.title}</h3>
                  <p className="text-dark-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/sell">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" size="lg">Get Free Valuation</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-dark-900">Why Choose BusinessFinder</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon icon={feature.icon} width={32} className="text-primary" />
                </div>
                <h3 className="font-bold text-dark-900 mb-2">{feature.title}</h3>
                <p className="text-dark-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-dark-400 mb-8">Join thousands of entrepreneurs who trust BusinessFinder for their acquisitions.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/marketplace">
              <Button variant="primary" size="lg">Browse Businesses</Button>
            </Link>
            <Link href="/sell">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-dark-900">
                List Your Business
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
