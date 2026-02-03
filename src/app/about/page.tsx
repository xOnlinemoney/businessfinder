'use client';

import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stats = [
  { value: '$2B+', label: 'Total Transaction Value' },
  { value: '10,000+', label: 'Businesses Listed' },
  { value: '5,000+', label: 'Successful Acquisitions' },
  { value: '98%', label: 'Customer Satisfaction' },
];

const values = [
  {
    title: 'Transparency',
    description: 'We believe in complete transparency throughout the buying and selling process.',
    icon: 'mdi:eye',
  },
  {
    title: 'Trust',
    description: 'Building trust between buyers and sellers is at the core of everything we do.',
    icon: 'mdi:shield-check',
  },
  {
    title: 'Excellence',
    description: 'We strive for excellence in our platform, processes, and customer service.',
    icon: 'mdi:star',
  },
  {
    title: 'Innovation',
    description: 'Continuously improving our platform to make acquisitions easier and safer.',
    icon: 'mdi:lightbulb',
  },
];

const team = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former M&A advisor with 15 years of experience in business acquisitions.',
  },
  {
    name: 'Michael Ross',
    role: 'CTO & Co-Founder',
    bio: 'Built and sold two successful SaaS companies before founding BusinessFinder.',
  },
  {
    name: 'Emily Watson',
    role: 'VP of Operations',
    bio: 'Operations expert who has helped close over 500 business transactions.',
  },
  {
    name: 'David Kim',
    role: 'Head of Business Development',
    bio: 'Connects buyers with perfect acquisition opportunities.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About BusinessFinder
            </h1>
            <p className="text-xl text-gray-300">
              We&apos;re on a mission to make buying and selling online businesses
              as simple, transparent, and secure as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-dark mb-6">Our Story</h2>
            <div className="text-gray-600 space-y-4 text-lg">
              <p>
                BusinessFinder was founded in 2020 by a team of entrepreneurs who had
                personally experienced the challenges of buying and selling online businesses.
              </p>
              <p>
                We saw a fragmented market with limited transparency, where buyers struggled
                to find quality opportunities and sellers had difficulty reaching qualified
                buyers. We knew there had to be a better way.
              </p>
              <p>
                Today, BusinessFinder is the leading marketplace for online business acquisitions,
                helping thousands of entrepreneurs achieve their dreams of business ownership
                or successful exits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon icon={value.icon} className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-dark mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-4">Leadership Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our experienced team brings together expertise in M&A, technology, and operations.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <Icon icon="mdi:account" className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="font-semibold text-dark">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of entrepreneurs who trust BusinessFinder
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/marketplace">
              <Button variant="secondary" size="lg">
                Browse Businesses
              </Button>
            </Link>
            <Link href="/sell">
              <Button variant="secondary" size="lg">
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
