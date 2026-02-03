'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

const financingOptions = [
  {
    title: 'SBA Loans',
    description: 'Government-backed loans with competitive rates and longer terms for qualified buyers.',
    icon: 'mdi:bank',
    rate: '6.5% - 9.5%',
    term: 'Up to 25 years',
    amount: '$50K - $5M',
    features: ['Low down payment (10-20%)', 'Fixed or variable rates', 'Long repayment terms', 'Government guaranteed'],
  },
  {
    title: 'Seller Financing',
    description: 'Negotiate directly with the seller for flexible payment terms.',
    icon: 'mdi:handshake',
    rate: '5% - 10%',
    term: '3-7 years',
    amount: 'Varies',
    features: ['Flexible terms', 'Faster closing', 'Shows seller confidence', 'Lower upfront costs'],
  },
  {
    title: 'Acquisition Loans',
    description: 'Traditional bank loans specifically designed for business acquisitions.',
    icon: 'mdi:cash-multiple',
    rate: '7% - 12%',
    term: '5-10 years',
    amount: '$100K - $10M+',
    features: ['Competitive rates', 'Structured payments', 'Asset-based options', 'Working capital included'],
  },
  {
    title: 'Equity Investment',
    description: 'Partner with investors who provide capital in exchange for ownership.',
    icon: 'mdi:account-group',
    rate: 'Equity share',
    term: 'Varies',
    amount: '$500K+',
    features: ['No debt repayment', 'Strategic partners', 'Shared risk', 'Growth capital'],
  },
];

const lenders = [
  { name: 'Live Oak Bank', specialty: 'SBA Loans', minAmount: '$350K', rating: 4.8 },
  { name: 'Celtic Bank', specialty: 'SBA Loans', minAmount: '$100K', rating: 4.6 },
  { name: 'Guidant Financial', specialty: 'ROBS/401K', minAmount: '$50K', rating: 4.7 },
  { name: 'Biz2Credit', specialty: 'Business Loans', minAmount: '$25K', rating: 4.4 },
  { name: 'Fundbox', specialty: 'Lines of Credit', minAmount: '$1K', rating: 4.5 },
];

const availableTimes = [
  { value: '', label: 'Select a time slot' },
  { value: 'morning', label: 'Morning (9am - 12pm EST)' },
  { value: 'afternoon', label: 'Afternoon (12pm - 5pm EST)' },
  { value: 'evening', label: 'Evening (5pm - 7pm EST)' },
];

export default function FinancingPage() {
  const [loanAmount, setLoanAmount] = useState('500000');
  const [downPayment, setDownPayment] = useState('100000');
  const [interestRate, setInterestRate] = useState('8');
  const [loanTerm, setLoanTerm] = useState('10');

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPreQualifyModal, setShowPreQualifyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredTime: '',
    loanAmount: '',
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
    setFormData({ name: '', email: '', phone: '', preferredTime: '', loanAmount: '', message: '' });
    setIsSubmitted(false);
  };

  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(loanAmount) - parseFloat(downPayment);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const months = parseFloat(loanTerm) * 12;

    if (monthlyRate === 0) return principal / months;

    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                   (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalPayment = monthlyPayment * parseFloat(loanTerm) * 12;
  const totalInterest = totalPayment - (parseFloat(loanAmount) - parseFloat(downPayment));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-dark to-dark/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Financing Options for Your Acquisition
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Explore various financing solutions to fund your business purchase.
              We partner with top lenders to help you find the right fit.
            </p>
            <Button size="lg" onClick={scrollToCalculator}>
              <Icon icon="mdi:calculator" className="w-5 h-5 mr-2" />
              Calculate Your Payment
            </Button>
          </div>
        </div>
      </section>

      {/* Financing Options */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-4">Financing Options</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Choose from multiple financing structures based on your situation and the deal
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {financingOptions.map((option, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon icon={option.icon} className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-dark mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Rate</p>
                        <p className="font-semibold text-dark">{option.rate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Term</p>
                        <p className="font-semibold text-dark">{option.term}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Amount</p>
                        <p className="font-semibold text-dark">{option.amount}</p>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <Icon icon="mdi:check" className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Loan Calculator */}
      <section id="calculator" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-4">Loan Calculator</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Estimate your monthly payments with our simple calculator
          </p>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Input
                    label="Purchase Price ($)"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                  <Input
                    label="Down Payment ($)"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                  />
                  <Input
                    label="Interest Rate (%)"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term</label>
                    <select
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="5">5 years</option>
                      <option value="7">7 years</option>
                      <option value="10">10 years</option>
                      <option value="15">15 years</option>
                      <option value="20">20 years</option>
                      <option value="25">25 years</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-dark mb-6">Estimated Payments</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-gray-600">Loan Amount</span>
                      <span className="text-xl font-bold text-dark">
                        ${(parseFloat(loanAmount) - parseFloat(downPayment)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-gray-600">Monthly Payment</span>
                      <span className="text-2xl font-bold text-primary">
                        ${monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b">
                      <span className="text-gray-600">Total Interest</span>
                      <span className="font-semibold text-dark">
                        ${totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Payment</span>
                      <span className="font-semibold text-dark">
                        ${totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full mt-6" onClick={() => { setShowPreQualifyModal(true); setIsSubmitted(false); }}>
                    Get Pre-Qualified
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Lending Partners */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark text-center mb-4">Our Lending Partners</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            We work with trusted lenders who specialize in business acquisition financing
          </p>

          <div className="grid md:grid-cols-5 gap-4">
            {lenders.map((lender, index) => (
              <Card key={index} className="p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Icon icon="mdi:bank" className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-dark mb-1">{lender.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{lender.specialty}</p>
                <p className="text-xs text-gray-600">Min: {lender.minAmount}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Icon icon="mdi:star" className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{lender.rating}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help With Financing?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Our acquisition advisors can connect you with the right lenders for your deal
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="secondary" size="lg" onClick={() => { setShowScheduleModal(true); setIsSubmitted(false); }}>
              <Icon icon="mdi:phone" className="w-5 h-5 mr-2" />
              Schedule a Call
            </Button>
            <Link href="/contact">
              <Button variant="secondary" size="lg">
                <Icon icon="mdi:email" className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Schedule Call Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => { setShowScheduleModal(false); resetForm(); }}
        title="Schedule a Financing Consultation"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Call Scheduled!</h3>
            <p className="text-dark-600 mb-6">
              A financing advisor will call you at your selected time.
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
              placeholder="Tell us about the acquisition you're considering..."
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

      {/* Pre-Qualify Modal */}
      <Modal
        isOpen={showPreQualifyModal}
        onClose={() => { setShowPreQualifyModal(false); resetForm(); }}
        title="Get Pre-Qualified for Financing"
      >
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:check-circle-bold" className="text-emerald-600" width={32} />
            </div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Application Submitted!</h3>
            <p className="text-dark-600 mb-6">
              We&apos;ll review your information and get back to you within 24-48 hours with pre-qualification details.
            </p>
            <Button variant="primary" onClick={() => { setShowPreQualifyModal(false); resetForm(); }}>
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
            <Input
              label="Desired Loan Amount"
              placeholder="$500,000"
              value={formData.loanAmount}
              onChange={(e) => handleChange('loanAmount', e.target.value)}
              required
            />
            <Textarea
              label="Tell us about your acquisition"
              placeholder="What type of business are you looking to acquire?"
              rows={3}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
            />
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowPreQualifyModal(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" isLoading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Get Pre-Qualified'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
