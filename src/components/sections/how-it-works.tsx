'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: 'solar:magnifer-linear',
    title: 'Discover Opportunities',
    description: 'Browse thousands of verified businesses with detailed financials, metrics, and growth data.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: 'solar:shield-check-linear',
    title: 'Sign NDA & Get Access',
    description: 'Sign a digital NDA to unlock confidential details, P&L statements, and direct seller contact.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: 'solar:chat-round-dots-linear',
    title: 'Connect & Negotiate',
    description: 'Message sellers directly, ask questions, schedule calls, and negotiate terms confidentially.',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: 'solar:document-text-linear',
    title: 'Make an Offer',
    description: 'Submit an official offer through our platform with clear terms and timeline.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: 'solar:checklist-linear',
    title: 'Due Diligence',
    description: 'Verify all claims with our guided due diligence process and expert support.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: 'solar:hand-shake-linear',
    title: 'Close the Deal',
    description: 'Secure escrow services and legal support to close your acquisition safely.',
    color: 'bg-cyan-100 text-cyan-600',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-4">
            <Icon icon="solar:bolt-linear" width={16} />
            Simple & Secure
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-dark-900 tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-dark-500 text-lg">
            Our streamlined process makes buying and selling online businesses secure and straightforward
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group"
            >
              {/* Connection Line (desktop) */}
              {index < steps.length - 1 && index !== 2 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-dark-200 -translate-y-1/2 z-0">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-dark-300" />
                </div>
              )}

              <div className="relative bg-dark-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-dark-200">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-dark-900 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-4', step.color)}>
                  <Icon icon={step.icon} width={28} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-dark-900 mb-2">{step.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
