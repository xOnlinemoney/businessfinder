'use client';

import React from 'react';
import { Icon } from '@iconify/react';

const stats = [
  {
    value: '$2.4B+',
    label: 'Transaction Value',
    description: 'Total value of businesses sold',
    icon: 'solar:dollar-linear',
    color: 'text-emerald-600',
  },
  {
    value: '15,000+',
    label: 'Businesses Sold',
    description: 'Successful acquisitions completed',
    icon: 'solar:bag-check-linear',
    color: 'text-primary',
  },
  {
    value: '98%',
    label: 'Success Rate',
    description: 'Deals closed successfully',
    icon: 'solar:chart-2-linear',
    color: 'text-purple-600',
  },
  {
    value: '45 Days',
    label: 'Avg. Time to Sell',
    description: 'From listing to closing',
    icon: 'solar:clock-circle-linear',
    color: 'text-amber-600',
  },
];

const testimonials = [
  {
    quote: "BusinessFinder helped me sell my SaaS for 5.2x annual profit. The process was smooth and the buyer was perfect.",
    author: 'Michael Chen',
    role: 'Sold SaaS for $2.1M',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    quote: "I acquired a content portfolio that's now generating 3x the income. The due diligence support was invaluable.",
    author: 'Sarah Williams',
    role: 'Acquired Content Site',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
];

export function StatsSection() {
  return (
    <section className="py-16 lg:py-24 bg-dark-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl mb-4">
                <Icon icon={stat.icon} className={stat.color} width={24} />
              </div>
              <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white/80 font-medium">{stat.label}</p>
              <p className="text-dark-400 text-sm mt-1">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Icon key={i} icon="solar:star-bold" className="text-amber-400" width={16} />
                ))}
              </div>
              <blockquote className="text-white/90 text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-white">{testimonial.author}</p>
                  <p className="text-dark-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <p className="text-center text-dark-400 text-sm mb-6">Trusted by entrepreneurs worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <Icon icon="simple-icons:stripe" width={80} className="text-white" />
            <Icon icon="simple-icons:y-combinator" width={32} className="text-white" />
            <Icon icon="simple-icons:techcrunch" width={120} className="text-white" />
            <Icon icon="simple-icons:forbes" width={80} className="text-white" />
            <Icon icon="simple-icons:producthunt" width={32} className="text-white" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
