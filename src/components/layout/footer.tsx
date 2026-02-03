'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

const footerLinks = {
  marketplace: {
    title: 'Marketplace',
    links: [
      { label: 'Browse Listings', href: '/marketplace' },
      { label: 'SaaS Businesses', href: '/marketplace?category=saas' },
      { label: 'E-commerce', href: '/marketplace?category=ecommerce' },
      { label: 'Content Sites', href: '/marketplace?category=content' },
      { label: 'Agencies', href: '/marketplace?category=agency' },
    ],
  },
  sellers: {
    title: 'For Sellers',
    links: [
      { label: 'Sell Your Business', href: '/onboarding' },
      { label: 'Valuation Guide', href: '/resources/valuation' },
      { label: 'Seller Dashboard', href: '/dashboard' },
      { label: 'Success Stories', href: '/resources/case-studies' },
    ],
  },
  buyers: {
    title: 'For Buyers',
    links: [
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Financing Options', href: '/financing' },
      { label: 'Due Diligence Guide', href: '/resources/due-diligence' },
      { label: 'Buyer FAQ', href: '/resources/faq' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Resources', href: '/resources' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
};

const socialLinks = [
  { icon: 'mdi:twitter', href: 'https://twitter.com', label: 'Twitter' },
  { icon: 'mdi:linkedin', href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: 'mdi:facebook', href: 'https://facebook.com', label: 'Facebook' },
  { icon: 'mdi:youtube', href: 'https://youtube.com', label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="bg-dark-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white">
                <Icon icon="solar:graph-up-linear" width={20} />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                Business<span className="font-normal text-dark-400">Finder</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              The premium marketplace for buying and selling profitable online businesses.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-dark-800 hover:bg-dark-700 rounded-lg flex items-center justify-center text-dark-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <Icon icon={social.icon} width={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-white text-sm mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-dark-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-dark-400 text-sm">
              © {new Date().getFullYear()} BusinessFinder. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-dark-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-dark-400 hover:text-white text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-dark-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
