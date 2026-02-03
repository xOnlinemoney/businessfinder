'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/utils';

const advisors = [
  {
    name: 'Jessica Adams',
    role: 'Your Selling Advisor',
    description: 'Handling inquiries & offers for your listings',
    avatar: 'https://i.pravatar.cc/150?img=48',
    email: 'jessica@businessfinder.com',
    phone: '+1234567890',
    color: 'primary',
    online: true,
  },
  {
    name: 'Marcus Chen',
    role: 'Your Buying Advisor',
    description: 'Helping you find & acquire businesses',
    avatar: 'https://i.pravatar.cc/150?img=60',
    email: 'marcus@businessfinder.com',
    phone: '+1234567891',
    color: 'purple',
    online: true,
  },
];

const helpCategories = [
  {
    title: 'Selling a Business',
    description: 'Listing, pricing, offers',
    icon: 'solar:tag-price-bold',
    color: 'emerald',
    href: '#selling',
  },
  {
    title: 'Buying a Business',
    description: 'Search, offers, due diligence',
    icon: 'solar:cart-large-2-bold',
    color: 'blue',
    href: '#buying',
  },
  {
    title: 'Account & Billing',
    description: 'Profile, payments, settings',
    icon: 'solar:user-circle-bold',
    color: 'purple',
    href: '#account',
  },
  {
    title: 'Legal & NDAs',
    description: 'Agreements, confidentiality',
    icon: 'solar:shield-check-bold',
    color: 'amber',
    href: '#legal',
  },
];

const sellerFaqs = [
  {
    question: 'How do I list my business for sale?',
    answer: `Listing your business is simple:
1. Click "List a Business" in the sidebar
2. Complete the onboarding questionnaire
3. Upload your financial documents
4. Our team will verify your information
5. Your listing goes live within 24-48 hours

Your dedicated advisor will guide you through every step.`,
  },
  {
    question: 'What are your fees for selling?',
    answer: `Our fee structure is simple and success-based:
• Listing fee: Free to list your business
• Success fee: Small percentage only when your business sells
• No hidden fees: Advisory support is included`,
  },
  {
    question: 'How do I respond to buyer inquiries?',
    answer: `You don't have to! Your dedicated advisor handles all buyer communications on your behalf. They qualify and screen buyers, handle negotiations, and keep you updated through your Inquiries dashboard.`,
  },
  {
    question: 'How do I accept or counter an offer?',
    answer: `Go to "Offers Received" in your dashboard. Review the offer details and your advisor's recommendation, then click Accept, Counter, or Decline. Your advisor will communicate your decision to the buyer.`,
  },
];

const buyerFaqs = [
  {
    question: 'What is an NDA and why do I need one?',
    answer: `An NDA (Non-Disclosure Agreement) protects the seller's confidential information. Once signed, you'll gain access to:
• Detailed financial statements
• Customer data and contracts
• Technical documentation
• Operational details`,
  },
  {
    question: 'How do I submit an offer?',
    answer: `Sign the NDA to access confidential info, review the documents, then contact your buying advisor to discuss. Submit your offer through the listing page and track it in "My Offers".`,
  },
  {
    question: 'What happens after my offer is accepted?',
    answer: `Congratulations! Here's what happens next:
1. LOI signed by both parties
2. Due diligence period begins
3. Legal review and purchase agreement
4. Closing and ownership transfer`,
  },
  {
    question: 'Can I withdraw my offer?',
    answer: `Yes, you can withdraw before acceptance. Go to "My Offers" and click "Withdraw". Note: Once an LOI is signed, withdrawing may have legal implications.`,
  },
];

const supportOptions = [
  {
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: 'solar:chat-round-dots-bold',
    color: 'blue',
    action: 'Start Chat',
    actionIcon: 'solar:chat-line-linear',
  },
  {
    title: 'Phone Support',
    description: 'Mon-Fri, 9am-6pm EST',
    icon: 'solar:phone-calling-bold',
    color: 'emerald',
    action: '1-800-123-4567',
    actionIcon: 'solar:phone-linear',
    href: 'tel:+18001234567',
  },
  {
    title: 'Email Support',
    description: 'We respond within 24 hours',
    icon: 'solar:letter-bold',
    color: 'purple',
    action: 'Send Email',
    actionIcon: 'solar:plain-linear',
    href: 'mailto:support@businessfinder.com',
  },
  {
    title: 'Knowledge Base',
    description: 'Guides and tutorials',
    icon: 'solar:book-bold',
    color: 'amber',
    action: 'Browse Articles',
    actionIcon: 'solar:library-linear',
  },
];

const resources = [
  {
    title: "Seller's Guide",
    description: 'A comprehensive guide on preparing, listing, and successfully selling your online business.',
    icon: 'solar:document-text-bold',
    gradient: 'from-emerald-400 to-teal-500',
    hoverColor: 'emerald',
  },
  {
    title: "Buyer's Guide",
    description: 'Learn how to search for deals, perform due diligence, and acquire businesses safely.',
    icon: 'solar:cart-check-bold',
    gradient: 'from-blue-400 to-indigo-500',
    hoverColor: 'blue',
  },
  {
    title: 'Valuation Calculator',
    description: 'Estimate what your business is worth based on revenue, profit, and industry multiples.',
    icon: 'solar:calculator-bold',
    gradient: 'from-purple-400 to-fuchsia-500',
    hoverColor: 'purple',
  },
];

const quickSearchTags = ['Listing Process', 'Pricing & Fees', 'NDA Questions', 'Making an Offer'];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-dark-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-dark-50 transition-colors group"
      >
        <span className="text-sm font-semibold text-dark-700 group-hover:text-dark-900 pr-4">
          {question}
        </span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          width={18}
          className={cn(
            'text-dark-400 shrink-0 transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="px-5 pb-5 text-sm text-dark-600 leading-relaxed whitespace-pre-line">
          {answer}
        </div>
      </div>
    </div>
  );
}

const availableTimes = [
  { value: '', label: 'Select a time slot' },
  { value: 'morning', label: 'Morning (9am - 12pm EST)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm EST)' },
  { value: 'evening', label: 'Evening (5pm - 7pm EST)' },
];

const issueTypes = [
  { value: '', label: 'Select issue type' },
  { value: 'listing', label: 'Listing Issues' },
  { value: 'account', label: 'Account Problems' },
  { value: 'payment', label: 'Payment/Billing' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'other', label: 'Other' },
];

export function SupportContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredTime: '',
    issueType: '',
    message: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', preferredTime: '', issueType: '', message: '' });
    setIsSubmitted(false);
  };

  const handleSupportAction = (title: string) => {
    if (title === 'Live Chat') {
      setShowChatModal(true);
    } else if (title === 'Knowledge Base') {
      // Scroll to FAQ sections
      document.getElementById('selling')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Header */}
      <header className="hidden lg:flex sticky top-0 z-30 bg-white border-b border-dark-200 h-16 px-8 items-center justify-between">
        <h1 className="text-lg font-bold text-dark-900 tracking-tight">Help & Support</h1>
        <div className="flex items-center gap-3">
          <button className="p-2 text-dark-500 hover:text-dark-900 hover:bg-dark-100 rounded-lg transition-colors relative">
            <Icon icon="solar:bell-linear" width={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
        {/* Hero Search Section */}
        <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-3xl p-6 lg:p-10 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight">How can we help you?</h1>
            <p className="text-blue-100 mb-6">Search our knowledge base or get in touch with your dedicated advisor</p>
            <div className="relative">
              <Icon icon="solar:magnifer-linear" width={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="Search for answers... (e.g., 'How do I list my business?')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-4 text-dark-900 bg-white rounded-2xl border-0 shadow-lg focus:ring-4 focus:ring-white/30 outline-none text-base placeholder-dark-400"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {quickSearchTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-sm font-medium rounded-full transition-colors backdrop-blur-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Your Advisor */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-dark-900 mb-4 tracking-tight">Contact Your Advisor</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {advisors.map((advisor) => (
              <Card
                key={advisor.name}
                padding="none"
                className={cn(
                  'p-5 transition-all duration-300 hover:shadow-lg group',
                  advisor.color === 'primary' ? 'hover:border-primary/30' : 'hover:border-purple-300'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={advisor.avatar}
                      alt={advisor.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    {advisor.online && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={cn(
                        'text-xs font-semibold uppercase tracking-wide',
                        advisor.color === 'primary' ? 'text-primary' : 'text-purple-600'
                      )}>
                        {advisor.role}
                      </p>
                      {advisor.online && (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Online
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-dark-900 truncate">{advisor.name}</h3>
                    <p className="text-sm text-dark-500 mb-4 line-clamp-1">{advisor.description}</p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${advisor.phone}`}
                        className="flex-1 h-9 px-3 flex items-center justify-center gap-1.5 text-sm font-medium text-dark-700 bg-dark-50 border border-dark-200 rounded-lg hover:bg-dark-100 hover:border-dark-300 transition-colors"
                      >
                        <Icon icon="solar:phone-bold" width={16} />
                        Call
                      </a>
                      <a
                        href={`mailto:${advisor.email}`}
                        className={cn(
                          'flex-1 h-9 px-3 flex items-center justify-center gap-1.5 text-sm font-medium text-white rounded-lg transition-colors',
                          advisor.color === 'primary' ? 'bg-primary hover:bg-primary-dark' : 'bg-purple-600 hover:bg-purple-700'
                        )}
                      >
                        <Icon icon="solar:letter-bold" width={16} />
                        Email
                      </a>
                      <button className="w-9 h-9 flex items-center justify-center text-dark-400 hover:text-dark-600 bg-transparent hover:bg-dark-50 rounded-lg transition-colors">
                        <Icon icon="solar:calendar-bold" width={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Browse by Topic */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-dark-900 mb-4 tracking-tight">Browse by Topic</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {helpCategories.map((category) => (
              <a
                key={category.title}
                href={category.href}
                className="bg-white rounded-2xl border border-dark-200 p-5 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col h-full"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                  category.color === 'emerald' && 'bg-emerald-50 group-hover:bg-emerald-100',
                  category.color === 'blue' && 'bg-blue-50 group-hover:bg-blue-100',
                  category.color === 'purple' && 'bg-purple-50 group-hover:bg-purple-100',
                  category.color === 'amber' && 'bg-amber-50 group-hover:bg-amber-100'
                )}>
                  <Icon
                    icon={category.icon}
                    width={24}
                    className={cn(
                      category.color === 'emerald' && 'text-emerald-600',
                      category.color === 'blue' && 'text-blue-600',
                      category.color === 'purple' && 'text-purple-600',
                      category.color === 'amber' && 'text-amber-600'
                    )}
                  />
                </div>
                <h3 className="font-semibold text-dark-900 mb-1">{category.title}</h3>
                <p className="text-xs text-dark-500">{category.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Seller FAQs */}
          <div id="selling" className="bg-white rounded-2xl border border-dark-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-dark-100 bg-gradient-to-r from-emerald-50/50 to-green-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-emerald-100">
                  <Icon icon="solar:tag-price-bold" width={20} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-900">For Sellers</h3>
                  <p className="text-xs text-dark-500">Listing & selling your business</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-dark-100">
              {sellerFaqs.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>

          {/* Buyer FAQs */}
          <div id="buying" className="bg-white rounded-2xl border border-dark-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-dark-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-blue-100">
                  <Icon icon="solar:cart-large-2-bold" width={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-900">For Buyers</h3>
                  <p className="text-xs text-dark-500">Finding & acquiring businesses</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-dark-100">
              {buyerFaqs.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>

        {/* More Ways to Get Help */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-dark-900 mb-4 tracking-tight">More Ways to Get Help</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportOptions.map((option) => (
              <div
                key={option.title}
                className="bg-white rounded-2xl border border-dark-200 p-5 text-center hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3',
                  option.color === 'blue' && 'bg-blue-50',
                  option.color === 'emerald' && 'bg-emerald-50',
                  option.color === 'purple' && 'bg-purple-50',
                  option.color === 'amber' && 'bg-amber-50'
                )}>
                  <Icon
                    icon={option.icon}
                    width={24}
                    className={cn(
                      option.color === 'blue' && 'text-blue-600',
                      option.color === 'emerald' && 'text-emerald-600',
                      option.color === 'purple' && 'text-purple-600',
                      option.color === 'amber' && 'text-amber-600'
                    )}
                  />
                </div>
                <h3 className="font-semibold text-dark-900 mb-1">{option.title}</h3>
                <p className="text-xs text-dark-500 mb-4">{option.description}</p>
                {option.href ? (
                  <a
                    href={option.href}
                    className={cn(
                      'w-full h-9 flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors',
                      option.color === 'blue' && 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                      option.color === 'emerald' && 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                      option.color === 'purple' && 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                      option.color === 'amber' && 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                    )}
                  >
                    <Icon icon={option.actionIcon} width={16} />
                    {option.action}
                  </a>
                ) : (
                  <button
                    onClick={() => handleSupportAction(option.title)}
                    className={cn(
                      'w-full h-9 flex items-center justify-center gap-2 text-sm font-medium rounded-lg transition-colors',
                      option.color === 'blue' && 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                      option.color === 'emerald' && 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100',
                      option.color === 'purple' && 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                      option.color === 'amber' && 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                    )}
                  >
                    <Icon icon={option.actionIcon} width={16} />
                    {option.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources & Guides */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-dark-900 mb-4 tracking-tight">Resources & Guides</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <a
                key={resource.title}
                href="#"
                className={cn(
                  'group bg-white rounded-2xl border border-dark-200 overflow-hidden hover:shadow-md transition-all',
                  resource.hoverColor === 'emerald' && 'hover:border-emerald-300',
                  resource.hoverColor === 'blue' && 'hover:border-blue-300',
                  resource.hoverColor === 'purple' && 'hover:border-purple-300'
                )}
              >
                <div className={cn(
                  'h-32 flex items-center justify-center relative overflow-hidden bg-gradient-to-br',
                  resource.gradient
                )}>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon icon={resource.icon} width={48} className="text-white drop-shadow-sm" />
                </div>
                <div className="p-4">
                  <h3 className={cn(
                    'font-semibold text-dark-900 mb-1 transition-colors',
                    resource.hoverColor === 'emerald' && 'group-hover:text-emerald-600',
                    resource.hoverColor === 'blue' && 'group-hover:text-blue-600',
                    resource.hoverColor === 'purple' && 'group-hover:text-purple-600'
                  )}>
                    {resource.title}
                  </h3>
                  <p className="text-xs text-dark-500 line-clamp-2">{resource.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-dark-900 rounded-2xl p-6 lg:p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/5">
              <Icon icon="solar:hand-shake-bold" width={28} className="text-primary" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold mb-2 tracking-tight">Still need help?</h3>
            <p className="text-dark-400 mb-8 max-w-lg mx-auto text-sm lg:text-base">
              Our team is here to help you succeed. Whether you're buying or selling, we're just a message away.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto" onClick={() => { setShowContactModal(true); setIsSubmitted(false); }}>
                <Icon icon="solar:chat-round-dots-bold" width={18} />
                Contact Support
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto bg-white/10 text-white border border-white/10 hover:bg-white/20"
                onClick={() => { setShowScheduleModal(true); setIsSubmitted(false); }}
              >
                <Icon icon="solar:calendar-bold" width={18} />
                Schedule a Call
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Support Modal */}
        <Modal
          isOpen={showContactModal}
          onClose={() => { setShowContactModal(false); resetForm(); }}
          title="Contact Support"
        >
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Message Sent!</h3>
              <p className="text-dark-600 mb-6">
                Our support team will get back to you within 24 hours.
              </p>
              <Button variant="primary" onClick={() => { setShowContactModal(false); resetForm(); }}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Select
                label="Issue Type"
                options={issueTypes}
                value={formData.issueType}
                onChange={(e) => handleChange('issueType', e.target.value)}
                required
              />
              <Textarea
                label="How can we help?"
                placeholder="Describe your issue or question..."
                rows={4}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                required
              />
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowContactModal(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Schedule Call Modal */}
        <Modal
          isOpen={showScheduleModal}
          onClose={() => { setShowScheduleModal(false); resetForm(); }}
          title="Schedule a Support Call"
        >
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-900 mb-2">Call Scheduled!</h3>
              <p className="text-dark-600 mb-6">
                You&apos;ll receive a calendar invite at {formData.email} shortly.
              </p>
              <Button variant="primary" onClick={() => { setShowScheduleModal(false); resetForm(); }}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Smith"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
              <Select
                label="Preferred Time"
                options={availableTimes}
                value={formData.preferredTime}
                onChange={(e) => handleChange('preferredTime', e.target.value)}
                required
              />
              <Textarea
                label="What would you like to discuss?"
                placeholder="Briefly describe your question or issue..."
                rows={3}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
              />
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowScheduleModal(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                  {isSubmitting ? 'Scheduling...' : 'Schedule Call'}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Live Chat Modal */}
        <Modal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          title="Live Chat"
        >
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:chat-round-dots-bold" className="text-blue-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Starting Live Chat...</h3>
            <p className="text-dark-600 mb-6">
              Connecting you with a support agent. Average wait time: 2 minutes.
            </p>
            <div className="animate-pulse flex justify-center gap-1 mb-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <Button variant="secondary" onClick={() => setShowChatModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal>
      </main>
    </>
  );
}

export default SupportContent;
