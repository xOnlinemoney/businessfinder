'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const businessTypes = [
  {
    group: 'Online Businesses',
    options: ['SaaS / Software', 'E-commerce / DTC', 'Mobile App', 'Marketplace', 'Agency / Service', 'Content / Media', 'Newsletter', 'Community', 'Affiliate', 'Digital Products', 'Online Course', 'Subscription Box'],
  },
  {
    group: 'Food & Beverage',
    options: ['Restaurant', 'Fast Food', 'Café / Coffee Shop', 'Bar / Nightclub', 'Bakery', 'Food Truck', 'Catering', 'Juice Bar', 'Ice Cream Shop', 'Pizzeria'],
  },
  {
    group: 'Retail',
    options: ['Retail Store', 'Convenience Store', 'Grocery Store', 'Liquor Store', 'Clothing Boutique', 'Jewelry Store', 'Pet Store', 'Florist', 'Gift Shop', 'Smoke Shop', 'Pawn Shop'],
  },
  {
    group: 'Automotive',
    options: ['Gas Station', 'Auto Repair', 'Car Wash', 'Auto Dealership', 'Tire Shop', 'Auto Body Shop', 'Oil Change', 'Towing Company'],
  },
  {
    group: 'Health & Beauty',
    options: ['Salon', 'Barbershop', 'Spa', 'Nail Salon', 'Med Spa', 'Gym / Fitness', 'Yoga Studio', 'Tanning Salon', 'Massage Therapy', 'Dental Practice', 'Pharmacy'],
  },
  {
    group: 'Services',
    options: ['Laundromat', 'Dry Cleaner', 'Cleaning Service', 'Landscaping', 'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Pest Control', 'Moving Company', 'Storage Facility', 'Printing Shop'],
  },
  {
    group: 'Hospitality & Travel',
    options: ['Hotel / Motel', 'Bed & Breakfast', 'Travel Agency', 'Event Venue'],
  },
  {
    group: 'Education & Childcare',
    options: ['Daycare', 'Tutoring Center', 'Driving School', 'Dance Studio', 'Martial Arts', 'Music School'],
  },
  {
    group: 'Professional Services',
    options: ['Accounting Firm', 'Law Firm', 'Insurance Agency', 'Real Estate', 'Staffing Agency', 'Marketing Agency'],
  },
  {
    group: 'Industrial & Manufacturing',
    options: ['Manufacturing', 'Wholesale', 'Distribution', 'Construction', 'Trucking'],
  },
  {
    group: 'Other',
    options: ['Other (Please specify)'],
  },
];

const revenueOptions = ['Under $100k', '$100k - $500k', '$500k - $1M', '$1M - $5M', '$5M+'];
const timelineOptions = ['ASAP', '3-6 Months', '6-12 Months', 'Just exploring'];

const painPoints = [
  {
    icon: 'solar:hourglass-line-linear',
    title: 'The Waiting Game',
    description: 'Traditional brokers take 6-12 months to find a buyer, while charging exorbitant 10-15% success fees.',
  },
  {
    icon: 'solar:graph-down-linear',
    title: 'Undervaluation',
    description: 'Without accurate data, most owners undervalue their life\'s work by 20-40%. Don\'t guess your net worth.',
  },
  {
    icon: 'solar:ghost-smile-linear',
    title: 'Time Wasters',
    description: 'Public marketplaces flood your inbox with unqualified "buyers" who have no proof of funds and no intention to close.',
  },
];

const howItWorks = [
  { icon: 'solar:calculator-minimalistic-linear', title: 'Free Valuation', description: 'AI analyzes 50+ data points to determine true market value.', time: '5 minutes' },
  { icon: 'solar:rocket-2-linear', title: 'Strategic Listing', description: 'We craft a compelling listing marketed to 50k+ buyers.', time: '24 hours' },
  { icon: 'solar:target-linear', title: 'Qualified Matches', description: 'Offers from pre-vetted buyers with proof of funds.', time: '7-14 days' },
  { icon: 'solar:cup-star-linear', title: 'Close & Celebrate', description: 'Deal advisors guide negotiation to closing wire.', time: '30-60 days', highlight: true },
];

const testimonials = [
  {
    quote: 'I thought my SaaS was worth $400K. BusinessFinder\'s valuation came back at $650K, and we closed at $680K in just 38 days. Incredible.',
    author: 'Sarah M.',
    role: 'SaaS Founder',
    soldFor: '$680k',
  },
  {
    quote: 'After 6 months with a traditional broker and zero offers, I switched to BusinessFinder. Had 3 qualified offers within 2 weeks.',
    author: 'Michael T.',
    role: 'E-commerce',
    soldFor: '$1.2M',
  },
  {
    quote: 'The team handled everything. I just showed up to sign papers. Best decision I made was trusting them with my 10-year business.',
    author: 'Jennifer L.',
    role: 'Agency Owner',
    soldFor: '$890k',
  },
];

const trustFeatures = [
  { icon: 'solar:chart-2-linear', title: 'Precision Valuation', description: 'Our proprietary AI has analyzed 10,000+ transactions to value your business within 5% accuracy.' },
  { icon: 'solar:eye-closed-linear', title: 'Stealth Marketing', description: 'List confidentially. We never reveal your identity until you approve a buyer. Competitors won\'t know.' },
  { icon: 'solar:shield-check-linear', title: 'Verified Buyers Only', description: 'Every buyer is vetted with proof of funds and signed NDA. No tire-kickers, only serious acquirers.' },
  { icon: 'solar:users-group-rounded-linear', title: 'Expert Deal Advisors', description: 'Your dedicated advisor has closed 100+ deals and guides you from valuation to wire transfer.' },
];

const comparisonData = [
  { feature: 'Time to Sell', broker: '6-12 months', diy: 'Unknown', us: '47 days avg' },
  { feature: 'Commission', broker: '10-15%', diy: '$0 (hidden fees)', us: 'Success-based' },
  { feature: 'Buyer Quality', broker: 'Mixed', diy: 'Low', us: 'Pre-vetted' },
  { feature: 'Confidentiality', broker: 'Sometimes', diy: 'None', us: 'Guaranteed' },
  { feature: 'Valuation Accuracy', broker: 'Guesswork', diy: 'None', us: 'AI-Powered' },
];

const onlineBusinessTypes = ['SaaS & Software ($100K-$50M ARR)', 'E-commerce & DTC Brands', 'Content Sites & Newsletters', 'Mobile Apps & Marketplaces', 'Agencies & Consultancies'];
const physicalBusinessTypes = ['Restaurants & Food Service', 'Salons, Spas & Med Spas', 'Gas Stations & Auto Services', 'Professional Practices', 'Retail & Franchise'];

const faqs = [
  { question: 'How much does it cost to list?', answer: 'Listing is completely free. We only succeed when you succeed — our fee is a small percentage of your final sale price, significantly lower than traditional brokers.' },
  { question: 'How do you keep my sale confidential?', answer: 'Your business identity is never revealed publicly. Buyers must sign an NDA and prove funds before seeing any identifying details about your business.' },
  { question: 'What if my business doesn\'t sell?', answer: 'You pay nothing. Our success-based model means we\'re fully invested in finding you the right buyer at the right price. Zero risk to you.' },
  { question: 'How is my valuation calculated?', answer: 'Our AI analyzes your revenue, profit margins, growth rate, industry multiples, churn, and 47 other factors based on 10,000+ comparable transactions.' },
];

function ValuationForm({ variant = 'hero' }: { variant?: 'hero' | 'cta' }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="mdi:check" className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-dark-900 mb-2">Thank You!</h3>
        <p className="text-dark-500">We&apos;ll send your valuation report within 24 hours.</p>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {variant === 'cta' ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-dark-700 uppercase mb-1">Business Type</label>
            <select className="w-full bg-dark-50 border border-dark-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary">
              {businessTypes.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-dark-700 uppercase mb-1">Annual Revenue</label>
            <select className="w-full bg-dark-50 border border-dark-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary">
              {revenueOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <>
          <div>
            <label className="block text-xs font-semibold text-dark-700 uppercase mb-1.5 tracking-wider">Business Type</label>
            <select className="w-full bg-dark-50 border border-dark-200 text-dark-900 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-3 pr-10 font-medium">
              {businessTypes.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-700 uppercase mb-1.5 tracking-wider">Annual Revenue</label>
            <select className="w-full bg-dark-50 border border-dark-200 text-dark-900 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-3 pr-10 font-medium">
              {revenueOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-700 uppercase mb-1.5 tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full bg-dark-50 border border-dark-200 text-dark-900 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-3 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-700 uppercase mb-1.5 tracking-wider">Phone</label>
              <input
                type="tel"
                placeholder="(555) 000-0000"
                className="w-full bg-dark-50 border border-dark-200 text-dark-900 text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block p-3 font-medium"
              />
            </div>
          </div>
        </>
      )}

      {variant === 'cta' && (
        <>
          <div>
            <label className="block text-xs font-bold text-dark-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full bg-dark-50 border border-dark-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-dark-700 uppercase mb-1">How soon do you want to sell?</label>
            <select className="w-full bg-dark-50 border border-dark-200 rounded-lg p-3 text-sm focus:ring-primary focus:border-primary">
              {timelineOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center gap-2 text-base mt-2"
      >
        {isSubmitting ? (
          <>
            <Icon icon="mdi:loading" className="animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {variant === 'cta' ? 'Get My Free Valuation Now →' : 'Get My Valuation'}
            {variant !== 'cta' && <Icon icon="solar:arrow-right-linear" />}
          </>
        )}
      </button>
    </form>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details className="group bg-dark-50 rounded-xl" open={isOpen}>
      <summary
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="flex justify-between items-center font-medium cursor-pointer list-none p-6"
      >
        <span className="text-dark-900 font-semibold">{question}</span>
        <span className={cn('transition-transform duration-300', isOpen && 'rotate-180')}>
          <Icon icon="solar:alt-arrow-down-linear" className="text-dark-400" />
        </span>
      </summary>
      <div className="text-dark-500 px-6 pb-6 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}

export function SellContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToForm = () => {
    document.getElementById('valuation-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-dark-900/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                <Icon icon="solar:graph-up-linear" className="text-primary text-2xl" />
              </div>
              <span className="text-white text-xl font-bold tracking-tight">BusinessFinder</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">How It Works</a>
              <a href="#success-stories" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">Success Stories</a>
              <Link href="/marketplace" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">For Buyers</Link>
              <a href="#faq" className="text-dark-300 hover:text-white text-sm font-medium transition-colors">Resources</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="primary" className="shadow-lg shadow-primary/50" onClick={scrollToForm}>List Your Business</Button>
            </div>

            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Icon icon={mobileMenuOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} width={28} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-dark-900/95 backdrop-blur-xl md:hidden pt-24">
          <div className="px-6 py-8 space-y-6">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-white text-lg font-medium py-3 border-b border-white/10">How It Works</a>
            <a href="#success-stories" onClick={() => setMobileMenuOpen(false)} className="block text-white text-lg font-medium py-3 border-b border-white/10">Success Stories</a>
            <Link href="/marketplace" onClick={() => setMobileMenuOpen(false)} className="block text-white text-lg font-medium py-3 border-b border-white/10">For Buyers</Link>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-white text-lg font-medium py-3 border-b border-white/10">Resources</a>
            <Button variant="primary" className="w-full mt-6" onClick={() => { scrollToForm(); setMobileMenuOpen(false); }}>
              List Your Business
            </Button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-dark-900">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 to-dark-800" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                Sell Your Business for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Maximum Value</span> in 60 Days — Guaranteed
              </h1>

              <p className="text-lg text-dark-400 max-w-2xl mx-auto lg:mx-0 mb-8 font-light leading-relaxed">
                Join <span className="text-white font-medium">2,500+ founders</span> who sold their businesses for 15-40% above market value. Don't leave money on the table—our AI-powered matching connects you with qualified buyers actively looking to acquire.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start items-center text-sm text-dark-500 mb-10">
                <div className="flex items-center gap-2">
                  <Icon icon="solar:shield-check-linear" className="text-primary text-lg" />
                  <span>Backed by data from 10,000+ transactions</span>
                </div>
                <div className="hidden md:block w-1 h-1 bg-dark-700 rounded-full" />
                <div className="flex items-center gap-2">
                  <Icon icon="solar:chart-square-linear" className="text-primary text-lg" />
                  <span>$2.4B+ Transaction Volume</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 transform transition-all hover:translate-y-[-2px]">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-dark-900 mb-1">Get Your Free Business Valuation</h3>
                  <p className="text-dark-500 text-sm">See what your business is worth in 60 seconds.</p>
                </div>

                <ValuationForm variant="hero" />

                <div className="mt-4 text-center">
                  <p className="text-xs text-dark-400 flex items-center justify-center gap-1.5">
                    <Icon icon="solar:lock-keyhole-linear" />
                    100% Confidential • No spam • Unsubscribe anytime
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-between items-center opacity-40 grayscale px-4">
                <span className="text-xs text-white font-medium">As featured in:</span>
                <span className="text-white/60 text-sm font-medium">TechCrunch</span>
                <span className="text-white/60 text-sm font-medium">Forbes</span>
                <span className="text-white/60 text-sm font-medium">Bloomberg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">Selling a Business Shouldn't Be This Hard</h2>
            <p className="text-lg text-dark-500">Most founders leave significant wealth behind due to inefficient processes. Sound familiar?</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {painPoints.map((point) => (
              <div key={point.title} className="bg-red-50/50 p-8 rounded-2xl border border-red-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 text-red-600">
                  <Icon icon={point.icon} width={24} />
                </div>
                <h3 className="text-xl font-semibold text-dark-900 mb-3">{point.title}</h3>
                <p className="text-dark-600 leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-dark-50 border-y border-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm tracking-wide uppercase mb-2 block">The Solution</span>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">Your Path to a Successful Exit</h2>
            <p className="text-dark-500">Our proven 4-step process has helped thousands of founders.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-dark-200 -z-10" />

            <div className="grid md:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={step.title} className="relative pt-4 text-center group">
                  <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-md border-4 border-dark-50 group-hover:border-primary/20 transition-colors z-10">
                    <Icon icon={step.icon} className="text-primary text-3xl" />
                  </div>
                  <h3 className="text-lg font-bold text-dark-900 mb-2">{index + 1}. {step.title}</h3>
                  <p className="text-sm text-dark-500 px-2 mb-2">{step.description}</p>
                  <span className={cn(
                    'inline-block px-2 py-1 text-xs font-medium rounded-md',
                    step.highlight ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-primary'
                  )}>
                    {step.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <a href="#valuation-form">
                <Button size="lg" variant="primary" className="shadow-lg hover:-translate-y-1 transition-transform">
                  Start My Free Valuation
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="success-stories" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-2">Join Thousands of Successful Sellers</h2>
              <p className="text-dark-500">Real founders, real exits, life-changing results.</p>
            </div>
            <div className="flex gap-8 mt-6 md:mt-0">
              <div>
                <span className="block text-3xl font-bold text-dark-900">2,500+</span>
                <span className="text-sm text-dark-500">Exits</span>
              </div>
              <div>
                <span className="block text-3xl font-bold text-dark-900">$2.4B</span>
                <span className="text-sm text-dark-500">Volume</span>
              </div>
              <div>
                <span className="block text-3xl font-bold text-dark-900">47 Days</span>
                <span className="text-sm text-dark-500">Avg Time</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="bg-dark-50 p-8 rounded-2xl border border-dark-100 flex flex-col">
                <div className="flex items-center gap-1 mb-4 text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} icon="solar:star-bold" />
                  ))}
                </div>
                <p className="text-dark-900 text-lg font-medium italic mb-6 flex-grow">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between border-t border-dark-200 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-dark-200 rounded-full" />
                    <div>
                      <p className="text-sm font-bold text-dark-900">{testimonial.author}</p>
                      <p className="text-xs text-dark-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                    Sold for {testimonial.soldFor}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="#" className="text-primary font-medium hover:text-blue-700 inline-flex items-center gap-1">
              Read more success stories <Icon icon="solar:arrow-right-linear" />
            </a>
          </div>
        </div>
      </section>

      {/* Trust & Credibility */}
      <section className="py-24 bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why 2,500+ Business Owners Trust Us</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustFeatures.map((feature) => (
              <div key={feature.title} className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
                  <Icon icon={feature.icon} width={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">The Smart Way to Sell</h2>
            <p className="text-dark-500">See how we stack up against the alternatives.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-dark-200 shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-50 border-b border-dark-200">
                  <th className="p-6 text-sm font-bold text-dark-500 uppercase tracking-wider">Features</th>
                  <th className="p-6 text-sm font-bold text-dark-500 uppercase tracking-wider text-center">Traditional Broker</th>
                  <th className="p-6 text-sm font-bold text-dark-500 uppercase tracking-wider text-center">DIY Marketplace</th>
                  <th className="p-6 text-lg font-bold text-primary uppercase tracking-wider text-center bg-blue-50/50">BusinessFinder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {comparisonData.map((row) => (
                  <tr key={row.feature} className="hover:bg-dark-50/50">
                    <td className="p-6 font-medium text-dark-900">{row.feature}</td>
                    <td className="p-6 text-center text-dark-600">{row.broker}</td>
                    <td className="p-6 text-center text-dark-600">{row.diy}</td>
                    <td className="p-6 text-center font-bold text-dark-900 bg-blue-50/20">
                      {row.us} <span className="text-emerald-500 ml-1">✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Ideal Business Types */}
      <section className="py-24 bg-gradient-to-br from-dark-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">Perfect For These Business Types</h2>
            <p className="text-dark-500">We specialize in high-value digital and service businesses.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                <Icon icon="solar:laptop-minimalistic-linear" className="text-primary" /> Online Businesses
              </h3>
              <ul className="space-y-4">
                {onlineBusinessTypes.map((type) => (
                  <li key={type} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-dark-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <Icon icon="solar:check-read-linear" width={14} />
                    </div>
                    <span className="text-dark-900 font-medium">{type}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                <Icon icon="solar:shop-linear" className="text-primary" /> Brick & Mortar
              </h3>
              <ul className="space-y-4">
                {physicalBusinessTypes.map((type) => (
                  <li key={type} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-dark-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 flex-shrink-0">
                      <Icon icon="solar:check-read-linear" width={14} />
                    </div>
                    <span className="text-dark-900 font-medium">{type}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a href="#" className="text-dark-500 hover:text-primary text-sm font-medium transition-colors">
              Not sure if you qualify? Get a free assessment →
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-4">Questions? We've Got Answers</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="valuation-form" className="py-24 bg-gradient-to-br from-primary to-blue-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to See What Your Business is Worth?</h2>
            <p className="text-blue-100 text-lg mb-8">Get your free, confidential valuation in under 5 minutes.</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto text-dark-800">
            <ValuationForm variant="cta" />

            <div className="mt-4 flex flex-col md:flex-row items-center justify-between text-xs text-dark-400 px-2 gap-2">
              <span className="flex items-center gap-1">
                <Icon icon="solar:lock-keyhole-linear" /> 100% Confidential
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="solar:star-bold" className="text-yellow-400" /> 4.9/5 rating from 500+ sellers
              </span>
              <span className="flex items-center gap-1">✓ No obligation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SellContent;
